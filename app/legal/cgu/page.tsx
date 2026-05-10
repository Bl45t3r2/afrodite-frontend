import LegalLayout from '@/components/layout/LegalLayout';

export const metadata = { title: 'CGU — Afrodite', description: 'Conditions Générales d\'Utilisation d\'Afrodite.' };

export default function CGUPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" lastUpdated="1er janvier 2025">

      <p>Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme Afrodite, accessible à l'adresse <strong>afrodite.com</strong>, exploitée par la société Afrodite SAS (ci-après « la Plateforme »).</p>
      <p>En vous inscrivant ou en utilisant la Plateforme, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la Plateforme.</p>

      <h2>1. Objet de la Plateforme</h2>
      <p>Afrodite est une plateforme de mise en relation permettant aux utilisateurs de créer des profils personnels, de les rendre visibles à d'autres utilisateurs, et d'échanger via une messagerie privée. La Plateforme ne constitue pas une agence de services et n'est pas partie aux relations entre utilisateurs.</p>

      <h2>2. Conditions d'accès</h2>
      <h3>2.1 Âge minimum</h3>
      <p>L'accès à la Plateforme est strictement réservé aux personnes <strong>âgées de 18 ans ou plus</strong>. En vous inscrivant, vous attestez sur l'honneur avoir atteint cet âge. Afrodite se réserve le droit de suspendre tout compte dont l'utilisateur s'avère mineur.</p>

      <h3>2.2 Création de compte</h3>
      <p>L'inscription requiert une adresse email valide, un mot de passe sécurisé et la confirmation de votre email. Chaque utilisateur ne peut posséder qu'un seul compte. Les informations fournies doivent être exactes et à jour.</p>

      <h3>2.3 Sécurité du compte</h3>
      <p>Vous êtes responsable de la confidentialité de vos identifiants. Toute activité effectuée depuis votre compte est réputée vous être imputable. En cas d'utilisation non autorisée, contactez-nous immédiatement à <strong>contact@afrodite.com</strong>.</p>

      <h2>3. Règles de conduite</h2>
      <p>En utilisant la Plateforme, vous vous engagez à :</p>
      <ul>
        <li>Ne pas publier de contenu illicite, diffamatoire, obscène, menaçant ou portant atteinte aux droits de tiers ;</li>
        <li>Ne pas usurper l'identité d'une autre personne ;</li>
        <li>Ne pas utiliser la Plateforme à des fins de harcèlement ou de spam ;</li>
        <li>Ne pas tenter de contourner les mesures de sécurité de la Plateforme ;</li>
        <li>Ne pas publier de photos de tiers sans leur consentement explicite ;</li>
        <li>Respecter la législation en vigueur dans votre pays de résidence.</li>
      </ul>

      <h2>4. Contenu utilisateur</h2>
      <h3>4.1 Responsabilité</h3>
      <p>Vous êtes seul responsable des contenus (textes, photos, messages) que vous publiez sur la Plateforme. Afrodite ne modère pas les contenus a priori mais se réserve le droit de les supprimer a posteriori en cas de signalement ou de violation des présentes CGU.</p>

      <h3>4.2 Licence</h3>
      <p>En publiant du contenu sur la Plateforme, vous accordez à Afrodite une licence non exclusive, mondiale, gratuite pour afficher, reproduire et distribuer ce contenu dans le cadre du fonctionnement de la Plateforme.</p>

      <h2>5. Modération et sanctions</h2>
      <p>Afrodite se réserve le droit, sans préavis ni indemnité, de :</p>
      <ul>
        <li>Supprimer tout contenu contraire aux présentes CGU ;</li>
        <li>Suspendre temporairement ou définitivement tout compte en cas de violation ;</li>
        <li>Signaler aux autorités compétentes tout contenu ou comportement illicite.</li>
      </ul>

      <h2>6. Abonnements et paiements</h2>
      <p>Certaines fonctionnalités sont accessibles via des abonnements payants (Premium, VIP). Les tarifs sont indiqués en FCFA, TTC. Les paiements sont traités de manière sécurisée via notre prestataire Stripe. Aucun remboursement ne sera effectué pour les périodes d'abonnement entamées, sauf disposition légale contraire.</p>

      <h2>7. Limitation de responsabilité</h2>
      <p>Afrodite est une plateforme de mise en relation. Elle ne peut être tenue responsable :</p>
      <ul>
        <li>Du contenu publié par les utilisateurs ;</li>
        <li>Des relations nouées entre utilisateurs via la Plateforme ;</li>
        <li>Des interruptions de service liées à des événements hors de son contrôle ;</li>
        <li>De tout préjudice indirect résultant de l'utilisation de la Plateforme.</li>
      </ul>

      <h2>8. Propriété intellectuelle</h2>
      <p>La marque Afrodite, le logo, le design et tous les contenus produits par Afrodite sont protégés par le droit de la propriété intellectuelle. Toute reproduction sans autorisation expresse est interdite.</p>

      <h2>9. Modification des CGU</h2>
      <p>Afrodite se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email de toute modification substantielle. La poursuite de l'utilisation de la Plateforme après notification vaut acceptation des nouvelles CGU.</p>

      <h2>10. Droit applicable et juridiction</h2>
      <p>Les présentes CGU sont régies par le droit béninois. Tout litige relatif à leur interprétation ou à leur exécution sera soumis à la juridiction compétente de Cotonou (Bénin), sauf disposition légale impérative contraire.</p>

      <h2>11. Contact</h2>
      <p>Pour toute question relative aux présentes CGU : <strong>contact@afrodite.com</strong></p>

    </LegalLayout>
  );
}
