import { expect, test } from "@playwright/test";

test("parcours illustre de l'application ESIS", async ({ page }) => {
  await page.goto("/esis/#/esis/");

  await test.step("Consulter et filtrer les patients", async () => {
    await expect(
      page.getByRole("heading", { name: "Gestion des Patients" }),
    ).toBeVisible();
    await page.getByPlaceholder("Rechercher par nom, prénom ou NIR...").fill("Dubois");
    await page.waitForTimeout(700);
    await page.getByRole("cell", { name: "Dubois Marie" }).click();
    await expect(
      page.getByRole("heading", { name: "Dossier Patient: Dubois Marie" }),
    ).toBeVisible();
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Fermer" }).click();
  });

  await test.step("Ouvrir le détail d'une campagne de dépistage", async () => {
    await page.getByRole("link", { name: "Dépistage" }).click();
    await expect(
      page.getByRole("heading", { name: "Gestion des Campagnes de Dépistage" }),
    ).toBeVisible();
    await page.getByRole("heading", { name: "Dépistage Cancer du Sein 2026" }).click();
    await expect(
      page.getByRole("button", { name: "Modifier la campagne" }),
    ).toBeVisible();
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Fermer" }).click();
  });

  await test.step("Vérifier la messagerie sécurisée et une pièce jointe", async () => {
    await page.getByRole("link", { name: "Messagerie" }).click();
    await expect(
      page.getByRole("heading", { name: /Messagerie Sécurisée/ }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Sécurité" }).click();
    await expect(
      page.getByRole("heading", { name: "Mesures de sécurité de la messagerie e-SIS" }),
    ).toBeVisible();
    await page.waitForTimeout(700);
    await page.getByText("Résultats mammographie - Dépistage sein").click();
    await expect(
      page.getByRole("button", { name: "Répondre" }),
    ).toBeVisible();
    await expect(page.getByText("Pièce jointe sécurisée")).toBeVisible();
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Fermer" }).click();
  });

  await test.step("Afficher les rapports d'activite", async () => {
    await page.getByRole("link", { name: "Rapports" }).click();
    await expect(
      page.getByRole("heading", { name: "Rapports et Indicateurs d'Activité" }),
    ).toBeVisible();
    await page.getByRole("combobox").selectOption("1year");
    await expect(
      page.getByRole("heading", { name: "Évolution des dépistages réalisés" }),
    ).toBeVisible();
    await expect(page.getByText("Taux de suivi post-dépistage", { exact: true })).toBeVisible();
    await page.waitForTimeout(900);
  });
});
