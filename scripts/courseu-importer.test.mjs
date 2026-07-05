import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCourseUImportState,
  buildGrocyProductProposal,
  detectCourseUDuplicate,
  extractCourseUCategory,
  parseCourseUProductPage,
} from "./courseu-importer.mjs";

const categoryHtml = `
<h1>Viandes, poissons</h1>
<a href="/c/viandes-poissons/boucherie">Boucherie</a>
<a href="/c/viandes-poissons/volaille">Volaille</a>
<a href="/p/pep-s-poulet-manhattan-burger-maitre-coq-france-box-380g/999001.html">
  Pep's poulet Manhattan burger, MAÎTRE COQ, France, box, 380g
</a>
<a href="https://www.coursesu.com/p/terrine-de-saumon-guyader-350g/999002.html">Terrine de saumon GUYADER, 350g</a>
`;

const productHtml = `
<h1>Pep's poulet Manhattan burger, MAÎTRE COQ, France, box, 380g</h1>
<img alt="Nutriscore B">
<nav>
  <a>Accueil</a><a>Viandes, poissons</a><a>Volaille</a>
</nav>
<h2>Description</h2>
<ul><li>Recette au poulet façon burger Manhattan, prête à réchauffer.</li></ul>
<h3>Informations complémentaires</h3>
<p>Dénomination légale : Préparation panée à base de poulet</p>
<p>Poids net: 380 g</p>
<h3>Ingrédients</h3>
<p>Viande de poulet traitée en salaison 55%, chapelure, sauce, épices.</p>
<h3>Valeurs nutritionnelles</h3>
<p>Pour 100 g</p>
<p>Valeurs énergetiques</p>
<p>850 kJ | 203 kcal</p>
<p>Matières grasses</p><p>9 g</p>
<p>Dont Acides gras saturés</p><p>1.4 g</p>
<p>Glucides</p><p>18 g</p>
<p>Dont sucres</p><p>2.2 g</p>
<p>Protéines</p><p>12 g</p>
<p>Sel</p><p>1.1 g</p>
<h2>Conseils</h2>
<h3>Instruction de conservation</h3>
<p>A conserver entre 0°C et +4°C.</p>
`;

const grocyCatalog = {
  groups: [
    { id: 9, name: "Volailles" },
    { id: 13, name: "Produits carnés transformés (nuggets, steaks hachés, etc.)" },
    { id: 62, name: "Produits non classés" },
  ],
  units: [
    { id: 2, name: "Piece" },
    { id: 4, name: "Gramme" },
    { id: 8, name: "Boîte" },
    { id: 13, name: "Barquette" },
  ],
  locations: [{ id: 2, name: "Frigo" }],
  shoppingLocations: [{ id: 1, name: "Super U - Magasin" }],
  products: [],
  barcodes: [],
};

test("extractCourseUCategory returns category metadata and absolute product links", () => {
  const category = extractCourseUCategory(categoryHtml, "https://www.coursesu.com/c/viandes-poissons");

  assert.equal(category.title, "Viandes, poissons");
  assert.deepEqual(category.subcategories.map((item) => item.label), ["Boucherie", "Volaille"]);
  assert.equal(category.products.length, 2);
  assert.equal(category.products[0].courseUId, "999001");
  assert.equal(
    category.products[0].url,
    "https://www.coursesu.com/p/pep-s-poulet-manhattan-burger-maitre-coq-france-box-380g/999001.html",
  );
});

test("parseCourseUProductPage extracts factual product fields without prices when none are visible", () => {
  const product = parseCourseUProductPage(
    productHtml,
    "https://www.coursesu.com/p/pep-s-poulet-manhattan-burger-maitre-coq-france-box-380g/999001.html",
  );

  assert.equal(product.courseUId, "999001");
  assert.equal(product.name, "Pep's poulet Manhattan burger, MAÎTRE COQ, France, box, 380g");
  assert.equal(product.brand, "MAÎTRE COQ");
  assert.equal(product.origin, "France");
  assert.equal(product.packageText, "box, 380g");
  assert.equal(product.netWeight.grams, 380);
  assert.equal(product.nutriscore, "B");
  assert.equal(product.kcalPer100g, 203);
  assert.equal(product.legalName, "Préparation panée à base de poulet");
  assert.match(product.ingredients, /Viande de poulet/);
  assert.equal(product.visiblePrice, null);
});

test("buildGrocyProductProposal maps Course U meat products to Grocy fields and safe description", () => {
  const product = parseCourseUProductPage(
    productHtml,
    "https://www.coursesu.com/p/pep-s-poulet-manhattan-burger-maitre-coq-france-box-380g/999001.html",
  );
  const proposal = buildGrocyProductProposal(product, grocyCatalog);

  assert.equal(proposal.status, "review");
  assert.equal(proposal.confidence >= 0.75, true);
  assert.equal(proposal.productPayload.name, "Pep's poulet Manhattan burger - MAÎTRE COQ - 380g");
  assert.equal(proposal.productPayload.product_group_id, 9);
  assert.equal(proposal.productPayload.qu_id_stock, 4);
  assert.equal(proposal.productPayload.qu_id_purchase, 8);
  assert.equal(proposal.productPayload.location_id, 2);
  assert.equal(proposal.productPayload.calories, 2.03);
  assert.deepEqual(proposal.userfields, {
    Marque: "MAÎTRE COQ",
    Sous_marque: "",
    origine: "France",
    parent: "0",
  });
  assert.deepEqual(proposal.conversions, [
    { from_qu_id: 8, to_qu_id: 4, factor: 380 },
    { from_qu_id: 4, to_qu_id: 8, factor: 1 / 380 },
  ]);
  assert.match(proposal.productPayload.description, /Description/);
  assert.match(proposal.productPayload.description, /Source : Course U/);
  assert.doesNotMatch(proposal.productPayload.description, /prix local/i);
});

test("detectCourseUDuplicate finds existing products by Course U URL or normalized name", () => {
  const product = parseCourseUProductPage(
    productHtml,
    "https://www.coursesu.com/p/pep-s-poulet-manhattan-burger-maitre-coq-france-box-380g/999001.html",
  );
  const byUrl = detectCourseUDuplicate(product, {
    ...grocyCatalog,
    products: [{ id: 123, name: "Autre", description: "Source : Course U https://www.coursesu.com/p/x/999001.html" }],
  });
  const byName = detectCourseUDuplicate(product, {
    ...grocyCatalog,
    products: [{ id: 124, name: "Pep's poulet Manhattan burger - MAÎTRE COQ - 380g", description: "" }],
  });

  assert.equal(byUrl.kind, "courseu_url");
  assert.equal(byUrl.productId, 123);
  assert.equal(byName.kind, "normalized_name");
  assert.equal(byName.productId, 124);
});

test("buildCourseUImportState is a dry-run ledger and never marks proposals as created", () => {
  const product = parseCourseUProductPage(
    productHtml,
    "https://www.coursesu.com/p/pep-s-poulet-manhattan-burger-maitre-coq-france-box-380g/999001.html",
  );
  const state = buildCourseUImportState({
    categoryUrl: "https://www.coursesu.com/c/viandes-poissons",
    products: [product],
    catalog: grocyCatalog,
    mode: "dry-run",
  });

  assert.equal(state.mode, "dry-run");
  assert.equal(state.categoryUrl, "https://www.coursesu.com/c/viandes-poissons");
  assert.equal(state.items.length, 1);
  assert.equal(state.items[0].status, "review");
  assert.equal(state.items[0].productId, 0);
  assert.equal(state.summary.created, 0);
  assert.equal(state.summary.review, 1);
});
