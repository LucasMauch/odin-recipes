#!/usr/bin/env python3
"""Convierte el curso «Esperanto en 12 lecciones» (YAML) a JSON para la app.

Uso:
    python3 tools/importar.py RUTA_AL_REPO_ORIGINAL [--lengua es] [--salida lecciones]

RUTA_AL_REPO_ORIGINAL es un checkout de https://github.com/Esperanto/kurso-zagreba-metodo

Separación de licencias (ver docs/LICENCIAS.md):
  * `texto`  -> textos de lección en esperanto, CC BY-ND 4.0: se copian SIN cambios
                (solo cambia el formato YAML -> JSON). Nunca se reescriben.
  * el resto -> CC BY 4.0 (traducciones al español, gramática, ejercicios).
                Las tarjetas se derivan de ejercicios del curso; la app no
                modifica ningún texto de lección.
"""
import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

import yaml

NUM_LECCIONES = 12


def cargar(ruta):
    with open(ruta, encoding="utf-8") as f:
        return yaml.safe_load(f)


def palabra_a_texto(tokens):
    """Une una lista de tokens (palabra=[morfemas], None=espacio, str=puntuación)."""
    out = []
    for t in tokens:
        if t is None:
            out.append(" ")
        elif isinstance(t, str):
            out.append(t)
        else:
            out.append("".join(t))
    return "".join(out)


def parrafo_a_texto(parrafo):
    return re.sub(r"\s+", " ", palabra_a_texto(parrafo)).strip()


def titulo_a_texto(titulo):
    return palabra_a_texto(titulo).strip()


def id_carta(num, tipo, eo):
    h = hashlib.sha1(f"{num}|{tipo}|{eo}".encode("utf-8")).hexdigest()[:8]
    return f"L{num:02d}-{tipo}-{h}"


def a_lista(v):
    if v is None:
        return []
    return [str(x) for x in v] if isinstance(v, list) else [str(v)]


def reconstruir_cloze(partes):
    """Devuelve (frase_completa, huecos[], plantilla) desde la lista videbla/solvo."""
    completa, plantilla, huecos = [], [], []
    for p in partes:
        if not isinstance(p, dict):
            continue
        if "solvo" in p:
            sol = str(p["solvo"])
            completa.append(sol)
            plantilla.append("{" + str(len(huecos)) + "}")
            huecos.append(sol)
        else:
            v = p.get("videbla")
            txt = " " if v is None else str(v)
            completa.append(txt)
            plantilla.append(txt)
    norm = lambda s: re.sub(r"\s+", " ", s).strip()
    return norm("".join(completa)), huecos, norm("".join(plantilla))


def cartas_escribir(num, pares):
    """traduku: pares eo->es(lista). Agrupa por prompt español para evitar ambigüedad."""
    por_es = {}
    for eo, es in pares:
        es_l = a_lista(es)
        if not es_l:
            continue
        clave = es_l[0].strip().lower()
        d = por_es.setdefault(clave, {"es": es_l[0], "eo": []})
        if eo not in d["eo"]:
            d["eo"].append(eo)
    cartas = []
    for d in por_es.values():
        cartas.append({
            "id": id_carta(num, "palabra", d["eo"][0]),
            "tipo": "palabra",
            "lec": num,
            "es": d["es"],
            "eo": d["eo"][0],
            "aceptadas": d["eo"][1:],
        })
    return cartas


def importar_leccion(raiz, lengua, num):
    n = f"{num:02d}"
    base = Path(raiz) / "enhavo"
    nt = base / "netradukenda"
    tr = base / "tradukenda" / lengua

    texto = cargar(nt / "tekstoj" / f"{n}.yml")
    out = {
        "id": n,
        "numero": num,
        "titulo": titulo_a_texto(texto["titolo"]),
        "texto": {  # CC BY-ND 4.0: sin modificar
            "licencia": "CC BY-ND 4.0",
            "titolo_morfemas": texto["titolo"],
            "paragrafoj_morfemas": texto["paragrafoj"],
            "parrafos": [parrafo_a_texto(p) for p in texto["paragrafoj"]],
        },
    }

    gram = tr / "gramatiko" / f"{n}.md"
    out["gramatica_md"] = gram.read_text(encoding="utf-8") if gram.exists() else ""
    out["raices_nuevas"] = cargar(nt / "vortoj" / f"{n}.yml") or []

    cartas = []

    # 1) palabras (traduku): es -> eo
    trad = cargar(tr / "ekzercoj" / "traduku" / f"{n}.yml") or []
    pares = [(k, v) for d in trad for k, v in d.items()]
    cartas += cartas_escribir(num, pares)

    # 2) frases + cloze (kompletigu + kompletigu-la-frazojn)
    comp_es = cargar(tr / "ekzercoj" / "kompletigu" / f"{n}.yml") or []
    comp_eo = cargar(nt / "ekzercoj" / "kompletigu-la-frazojn" / f"{n}.yml") or []
    for i, par in enumerate(comp_es):
        (eo_frase, es_frase), = par.items()
        cartas.append({
            "id": id_carta(num, "frase", eo_frase),
            "tipo": "frase", "lec": num, "es": es_frase, "eo": eo_frase, "aceptadas": [],
        })
        if i < len(comp_eo):
            completa, huecos, plantilla = reconstruir_cloze(comp_eo[i])
            if huecos and re.sub(r"\s+", "", completa) == re.sub(r"\s+", "", eo_frase):
                cartas.append({
                    "id": id_carta(num, "cloze", eo_frase),
                    "tipo": "cloze", "lec": num, "es": es_frase, "eo": eo_frase,
                    "plantilla": plantilla, "huecos": huecos,
                })

    # 3) preguntas (traduku-kaj-respondu): es -> eo (concatenando la traducción directa)
    tkr = cargar(tr / "ekzercoj" / "traduku-kaj-respondu" / f"{n}.yml") or []
    for d in tkr:
        palabras = []
        for item in d.get("rektatraduko", []):
            if isinstance(item, dict):
                palabras.append(next(iter(item)))
            else:
                palabras.append(str(item))
        eo = re.sub(r"\s+([?!.,;:])", r"\1", " ".join(palabras)).strip()
        if eo:
            cartas.append({
                "id": id_carta(num, "pregunta", eo),
                "tipo": "pregunta", "lec": num, "es": d["demando"], "eo": eo, "aceptadas": [],
            })

    ids = [c["id"] for c in cartas]
    assert len(ids) == len(set(ids)), f"ids duplicados en lección {n}"
    out["cartas"] = cartas
    out["fuente"] = {
        "repositorio": "https://github.com/Esperanto/kurso-zagreba-metodo",
        "lengua": lengua,
    }
    return out


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("origen")
    ap.add_argument("--lengua", default="es")
    ap.add_argument("--salida", default="lecciones")
    ap.add_argument("--lecciones", type=int, nargs="*", default=list(range(1, NUM_LECCIONES + 1)))
    a = ap.parse_args(argv)
    salida = Path(a.salida)
    salida.mkdir(parents=True, exist_ok=True)
    indice = []
    for num in a.lecciones:
        lec = importar_leccion(a.origen, a.lengua, num)
        (salida / f"{lec['id']}.json").write_text(
            json.dumps(lec, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        indice.append({"id": lec["id"], "numero": num, "titulo": lec["titulo"],
                       "cartas": len(lec["cartas"])})
        print(f"lección {lec['id']}: {len(lec['cartas'])} tarjetas")
    (salida / "indice.json").write_text(
        json.dumps(indice, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return 0


if __name__ == "__main__":
    sys.exit(main())
