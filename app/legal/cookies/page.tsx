import LegalLayout from '@/components/layout/LegalLayout';

export const metadata = { title: 'Politique de cookies — Afrodite' };

export default function CookiesPage() {
  return (
    <LegalLayout title="Politique de cookies" lastUpdated="1er janvier 2025">

      <p>La présente politique explique ce que sont les cookies, comment Afrodite les utilise et comment vous pouvez les contrôler.</p>

      <h2>1. Qu'est-ce qu'un cookie ?</h2>
      <p>Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, téléphone, tablette) lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos préférences, votre session de connexion et d'analyser la fréquentation.</p>

      <h2>2. Cookies utilisés par Afrodite</h2>

      <h3>2.1 Cookies strictement nécessaires</h3>
      <p>Ces cookies sont indispensables au fonctionnement de la plateforme. Ils ne peuvent pas être désactivés.</p>
      <ul>
        <li><strong>Session d'authentification</strong> — maintient votre connexion active (JWT token) ;</li>
        <li><strong>Préférences de sécurité</strong> — protection contre les attaques CSRF ;</li>
        <li><strong>Consentement cookies</strong> — mémorise vos choix de cookies.</li>
      </ul>
      <p><strong>Durée :</strong> Session ou jusqu'à 7 jours (refresh token).</p>

      <h3>2.2 Cookies analytiques</h3>
      <p>Ces cookies nous aident à comprendre comment les visiteurs interagissent avec la plateforme. Toutes les données sont anonymisées.</p>
      <ul>
        <li><strong>Analyse de trafic</strong> — pages visitées, durée de session, source de trafic ;</li>
        <li><strong>Performance</strong> — temps de chargement, erreurs rencontrées.</li>
      </ul>
      <p><strong>Durée :</strong> 13 mois maximum. <strong>Base légale :</strong> Consentement.</p>

      <h3>2.3 Cookies de fonctionnalité</h3>
      <p>Ces cookies améliorent votre expérience en mémorisant vos préférences.</p>
      <ul>
        <li><strong>Préférences d'affichage</strong> — vue liste ou carte, filtres de recherche ;</li>
        <li><strong>Langue</strong> — langue d'affichage préférée.</li>
      </ul>
      <p><strong>Durée :</strong> 12 mois. <strong>Base légale :</strong> Intérêt légitime.</p>

      <h2>3. Cookies tiers</h2>
      <p>Certains de nos partenaires peuvent déposer des cookies sur votre appareil :</p>
      <ul>
        <li><strong>Stripe</strong> — pour le traitement sécurisé des paiements. Consultez la <a href="https://stripe.com/fr/privacy" target="_blank" rel="noopener">politique de confidentialité Stripe</a>.</li>
        <li><strong>Cloudinary</strong> — pour la diffusion optimisée des images.</li>
      </ul>

      <h2>4. Comment gérer vos cookies</h2>
      <h3>4.1 Via notre bannière</h3>
      <p>Lors de votre première visite, une bannière vous permet d'accepter ou de refuser les cookies non essentiels. Vous pouvez modifier vos choix à tout moment en bas de page.</p>

      <h3>4.2 Via votre navigateur</h3>
      <p>Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies :</p>
      <ul>
        <li><strong>Chrome :</strong> Paramètres → Confidentialité → Cookies ;</li>
        <li><strong>Firefox :</strong> Paramètres → Vie privée → Cookies ;</li>
        <li><strong>Safari :</strong> Préférences → Confidentialité ;</li>
        <li><strong>Edge :</strong> Paramètres → Cookies et autorisations de site.</li>
      </ul>
      <p>Attention : la désactivation des cookies essentiels peut perturber le fonctionnement de la plateforme.</p>

      <h2>5. Modifications</h2>
      <p>Nous pouvons mettre à jour cette politique à tout moment. La date de dernière mise à jour figure en haut de ce document.</p>

      <h2>6. Contact</h2>
      <p>Pour toute question concernant notre utilisation des cookies : <strong>privacy@afrodite.com</strong></p>

    </LegalLayout>
  );
}
