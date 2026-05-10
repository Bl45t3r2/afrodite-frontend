import LegalLayout from '@/components/layout/LegalLayout';

export const metadata = { title: 'Mentions légales — Afrodite' };

export default function MentionsPage() {
  return (
    <LegalLayout title="Mentions légales" lastUpdated="1er janvier 2025">

      <p>Conformément aux dispositions légales en vigueur, les présentes mentions légales définissent les informations relatives à l'éditeur et à l'hébergeur de la plateforme Afrodite.</p>

      <h2>1. Éditeur du site</h2>
      <ul>
        <li><strong>Dénomination sociale :</strong> Afrodite SAS</li>
        <li><strong>Forme juridique :</strong> Société par Actions Simplifiée</li>
        <li><strong>Siège social :</strong> Cotonou, République du Bénin</li>
        <li><strong>Capital social :</strong> 1 000 000 FCFA</li>
        <li><strong>Numéro d'immatriculation :</strong> RCCM BJ-COT-2025-B-XXXXX</li>
        <li><strong>Email :</strong> contact@afrodite.com</li>
        <li><strong>Directeur de la publication :</strong> [Nom du représentant légal]</li>
      </ul>

      <h2>2. Hébergement</h2>
      <ul>
        <li><strong>Hébergeur :</strong> [Nom de votre hébergeur, ex: OVH, DigitalOcean, Vercel]</li>
        <li><strong>Adresse :</strong> [Adresse de l'hébergeur]</li>
        <li><strong>Site web :</strong> [URL de l'hébergeur]</li>
      </ul>
      <p>La plateforme est hébergée sur des serveurs sécurisés situés dans l'Union Européenne ou dans un pays offrant un niveau de protection des données adéquat.</p>

      <h2>3. Propriété intellectuelle</h2>
      <p>L'ensemble des éléments constituant la plateforme Afrodite (textes, graphismes, logiciels, photographies, images, sons, plans, noms, logos, marques, créations et œuvres protégeables diverses, bases de données, etc.) est la propriété exclusive d'Afrodite SAS ou fait l'objet d'une autorisation d'utilisation.</p>
      <p>Toute reproduction, représentation, modification, publication, adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable d'Afrodite SAS.</p>

      <h2>4. Responsabilité</h2>
      <p>Afrodite SAS s'efforce de fournir des informations exactes et à jour sur la plateforme. Toutefois, Afrodite SAS ne peut garantir l'exactitude, la complétude ou l'actualité des informations publiées par les utilisateurs. Les informations présentes sur le site sont fournies à titre indicatif.</p>
      <p>Afrodite SAS décline toute responsabilité :</p>
      <ul>
        <li>Pour tout dommage résultant d'une intrusion frauduleuse d'un tiers ;</li>
        <li>Pour toute interruption ou indisponibilité de la plateforme ;</li>
        <li>Pour tout contenu publié par des utilisateurs tiers.</li>
      </ul>

      <h2>5. Données personnelles</h2>
      <p>Afrodite SAS collecte et traite des données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et à la législation béninoise applicable. Pour en savoir plus, consultez notre <strong>Politique de confidentialité</strong>.</p>
      <p>Conformément à la réglementation en vigueur, vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité de vos données. Pour exercer ces droits : <strong>privacy@afrodite.com</strong></p>

      <h2>6. Cookies</h2>
      <p>La plateforme utilise des cookies pour améliorer l'expérience utilisateur et à des fins d'analyse. Pour en savoir plus, consultez notre <strong>Politique de cookies</strong>.</p>

      <h2>7. Liens hypertextes</h2>
      <p>La plateforme peut contenir des liens vers des sites tiers. Afrodite SAS n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu. La présence de ces liens ne constitue pas une approbation de leur contenu.</p>

      <h2>8. Droit applicable</h2>
      <p>Les présentes mentions légales sont soumises au droit béninois. En cas de litige, les juridictions compétentes de Cotonou (Bénin) seront seules compétentes.</p>

      <h2>9. Contact</h2>
      <p>Pour toute question ou réclamation : <strong>contact@afrodite.com</strong></p>

    </LegalLayout>
  );
}
