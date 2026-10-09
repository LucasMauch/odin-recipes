import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "tools"))
import importar  # noqa: E402

# Mini-curso SINTÉTICO (no es contenido del curso real): solo para probar la estructura.
FIXTURE = {
    "enhavo/netradukenda/tekstoj/01.yml":
        "titolo:\n- - Pom\n  - o\nparagrafoj:\n- - - Mi\n  -\n  - - ham\n    - as\n  - .\n",
    "enhavo/netradukenda/vortoj/01.yml": "- pom\n",
    "enhavo/netradukenda/ekzercoj/kompletigu-la-frazojn/01.yml":
        "- - videbla: Mi\n  - videbla:\n  - solvo: havas\n  - videbla:\n  - videbla: pomon.\n",
    "enhavo/tradukenda/es/gramatiko/01.md": "# Tema *uno*\n\ntexto\n\n# Tema dos\n\n- a\n- b\n",
    "enhavo/tradukenda/es/vortaro/radiko.yml": "pom: manzana\nham: tener\n",
    "enhavo/tradukenda/es/vortaro/finajxo.yml": "o: Sustantivo\nas: Verbo en presente\n",
    "enhavo/tradukenda/es/vortaro/pronomo.yml": "mi: yo\n",
    "enhavo/tradukenda/es/ekzercoj/traduku/01.yml":
        "- pomo: manzana\n- frukto:\n  - fruta\n  - fruto\n- pomujo: manzana\n",
    "enhavo/tradukenda/es/ekzercoj/kompletigu/01.yml":
        "- Mi havas pomon.: Yo tengo una manzana.\n",
    "enhavo/tradukenda/es/ekzercoj/traduku-kaj-respondu/01.yml":
        "- demando: '¿Tienes una manzana?'\n  rektatraduko:\n  - Ĉu: Acaso\n  - vi: tú\n  - havas: tienes\n  - pomon: manzana\n  - '?'\n",
}


def crear(raiz):
    for ruta, txt in FIXTURE.items():
        p = Path(raiz) / ruta
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(txt, encoding="utf-8")


class TestImportar(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        crear(self.tmp.name)
        self.lec = importar.importar_leccion(self.tmp.name, "es", 1)

    def tearDown(self):
        self.tmp.cleanup()

    def test_texto_se_reconstruye_sin_cambios(self):
        self.assertEqual(self.lec["titulo"], "Pomo")
        self.assertEqual(self.lec["texto"]["parrafos"], ["Mi hamas."])
        self.assertEqual(self.lec["texto"]["paragrafoj_morfemas"], [[["Mi"], None, ["ham", "as"], "."]])
        self.assertEqual(self.lec["texto"]["licencia"], "CC BY-ND 4.0")

    def test_gramatica_se_divide_en_secciones(self):
        g = self.lec["gramatica"]
        self.assertEqual([x["titulo"] for x in g], ["Tema uno", "Tema dos"])
        self.assertEqual(g[0]["md"], "texto")
        self.assertIn("- a", g[1]["md"])

    def test_glosas_cubren_morfemas_del_texto(self):
        gl = self.lec["glosas"]
        self.assertEqual(gl["ham"], ["tener"])
        self.assertEqual(gl["as"], ["Verbo en presente"])
        self.assertEqual(gl["Mi"], ["yo"])  # mayúscula inicial: cae a minúscula
        self.assertEqual(gl["o"], ["Sustantivo"])

    def test_palabras_agrupadas_por_prompt_en_espanol(self):
        pal = [c for c in self.lec["cartas"] if c["tipo"] == "palabra"]
        manzana = [c for c in pal if c["es"] == "manzana"]
        self.assertEqual(len(manzana), 1)  # prompt ambiguo -> una sola tarjeta
        self.assertEqual({manzana[0]["eo"], *manzana[0]["aceptadas"]}, {"pomo", "pomujo"})
        self.assertEqual(len(pal), 2)

    def test_cloze_reconstruye_frase_y_huecos(self):
        c = next(c for c in self.lec["cartas"] if c["tipo"] == "cloze")
        self.assertEqual(c["huecos"], ["havas"])
        self.assertEqual(c["plantilla"], "Mi {0} pomon.")
        self.assertEqual(c["eo"], "Mi havas pomon.")

    def test_pregunta_une_la_traduccion_directa(self):
        c = next(c for c in self.lec["cartas"] if c["tipo"] == "pregunta")
        self.assertEqual(c["eo"], "Ĉu vi havas pomon?")
        self.assertEqual(c["es"], "¿Tienes una manzana?")

    def test_ids_estables_y_unicos(self):
        otra = importar.importar_leccion(self.tmp.name, "es", 1)
        self.assertEqual([c["id"] for c in self.lec["cartas"]], [c["id"] for c in otra["cartas"]])
        ids = [c["id"] for c in self.lec["cartas"]]
        self.assertEqual(len(ids), len(set(ids)))

    def test_cli_escribe_json_e_indice(self):
        with tempfile.TemporaryDirectory() as out:
            importar.main([self.tmp.name, "--salida", out, "--lecciones", "1"])
            self.assertEqual(json.loads((Path(out) / "indice.json").read_text())[0]["id"], "01")
            self.assertTrue((Path(out) / "01.json").exists())


if __name__ == "__main__":
    unittest.main()
