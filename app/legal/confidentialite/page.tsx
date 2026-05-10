import LegalLayout from '@/components/layout/LegalLayout';

export const metadata = { title: 'Politique de confidentialité — Afrodite' };

export default function ConfidentialitePage() {
  return (
    <LegalLayout title="Politique de confidentialité" lastUpdated="1er janvier 2025">

      <p>Afrodite SAS (ci-après « Afrodite ») attache une importance primordiale à la protection de vos données personnelles. La présente politique décrit comment nous collectons, utilisons et protégeons vos données lorsque vous utilisez notre plateforme.</p>

      <h2>1. Responsable du traitement</h2>
      <ul>
        <li><strong>Entité :</strong> Afrodite SAS</li>
        <li><strong>Adresse :</strong> Cotonou, République du Bénin</li>
        <li><strong>Contact DPO :</strong> privacy@afrodite.com</li>
      </ul>

      <h2>2. Données collectées</h2>
      <h3>2.1 Données que vous nous fournissez</h3>
      <ul>
        <li><strong>Inscription :</strong> nom affiché, adresse email, mot de passe (haché), âge, ville ;</li>
        <li><strong>Profil :</strong> biographie, photos, catégories, tarifs, numéro de téléphone (optionnel) ;</li>
        <li><strong>Messages :</strong> contenu des messages échangés avec d'autres utilisateurs ;</li>
        <li><strong>Paiements :</strong> informations transmises à Stripe (nous ne stockons pas vos coordonnées bancaires).</li>
      </ul>
      <h3>2.2 Données collectées automatiquement</h3>
      <ul>
        <li>Adresse IP, type de navigateur, système d'exploitation ;</li>
        <li>Pages visitées, durée de visite, clics (via cookies analytiques) ;</li>
        <li>Données de connexion et journaux d'activité.</li>
      </ul>

      <h2>3. Finalités du traitement</h2>
      <p>Nous utilisons vos données pour :</p>
      <ul>
        <li>Gérer votre compte et authentifier votre identité ;</li>
        <li>Afficher votre profil aux autres utilisateurs ;</li>
        <li>Vous permettre d'échanger des messages ;</li>
        <li>Traiter vos paiements et gérer vos abonnements ;</li>
        <li>Vous envoyer des notifications liées à votre compte (emails transactionnels) ;</li>
        <li>Assurer la sécurité et prévenir les fraudes ;</li>
        <li>Améliorer nos services via des analyses statistiques anonymisées ;</li>
        <li>Respecter nos obligations légales.</li>
      </ul>

      <h2>4. Base légale</h2>
      <ul>
        <li><strong>Exécution du contrat :</strong> traitement nécessaire à la fourniture du service ;</li>
        <li><strong>Consentement :</strong> pour les cookies non essentiels et communications marketing ;</li>
        <li><strong>Intérêt légitime :</strong> pour la sécurité et la prévention des fraudes ;</li>
        <li><strong>Obligation légale :</strong> pour la conservation de certaines données.</li>
      </ul>

      <h2>5. Durée de conservation</h2>
      <ul>
        <li><strong>Données de compte :</strong> durée de vie du compte + 3 ans après suppression ;</li>
        <li><strong>Messages :</strong> 12 mois après l'échange ;</li>
        <li><strong>Données de paiement :</strong> 5 ans (obligation comptable) ;</li>
        <li><strong>Cookies analytiques :</strong> 13 mois maximum.</li>
      </ul>

      <h2>6. Partage des données</h2>
      <p>Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :</p>
      <ul>
        <li><strong>Stripe</strong> — traitement des paiements ;</li>
        <li><strong>Cloudinary</strong> — stockage et diffusion des photos ;</li>
        <li><strong>Prestataires d'hébergement</strong> — infrastructure technique ;</li>
        <li><strong>Autorités compétentes</strong> — sur réquisition judiciaire.</li>
      </ul>
      <p>Ces prestataires sont contractuellement tenus de respecter la confidentialité de vos données.</p>

      <h2>7. Vos droits</h2>
      <p>Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Droit d'accès :</strong> obtenir une copie de vos données ;</li>
        <li><strong>Droit de rectification :</strong> corriger des données inexactes ;</li>
        <li><strong>Droit à l'effacement :</strong> demander la suppression de votre compte et données ;</li>
        <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré ;</li>
        <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements ;</li>
        <li><strong>Droit de limitation :</strong> limiter le traitement dans certaines circonstances.</li>
      </ul>
      <p>Pour exercer vos droits : <strong>privacy@afrodite.com</strong> — Nous répondrons dans un délai de 30 jours.</p>

      <h2>8. Sécurité</h2>
      <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement des mots de passe (bcrypt), connexions HTTPS, accès restreints aux données, sauvegardes régulières.</p>

      <h2>9. Modifications</h2>
      <p>Nous nous réservons le droit de modifier cette politique à tout moment. Toute modification substantielle vous sera communiquée par email. La date de dernière mise à jour figure en haut de ce document.</p>

      <h2>10. Contact</h2>
      <p>Pour toute question : <strong>privacy@afrodite.com</strong></p>

    </LegalLayout>
  );
}
