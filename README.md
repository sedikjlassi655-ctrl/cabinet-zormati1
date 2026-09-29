# Cabinet Zormati Athar — Site Complet

Site professionnel de kinésithérapie (Front + Back).

## Démarrage

```bash
cd cabinet-zormati-site
npm start
```

Puis ouvrir : **http://localhost:3000**

## Mot de passe Admin
`zormati2025`

## Fonctionnalités

### Front
- Page d'accueil moderne (bleu + rose du cartouche)
- Services + Packs de séances (5 / 10 / 15)
- Chatbot intelligent
- Formulaire de demande RDV

### Back (API Express)
- Stockage JSON (`data/db.json`)
- Création patient automatique à chaque demande RDV
- Suivi des séances (restantes / réalisées)
- Admin : voir demandes, marquer contacté, valider séances
- Patient : login email ou téléphone, progression visuelle

### Flux RDV
1. Patient remplit le formulaire → données envoyées à l'API
2. Notification dans la console serveur + visible dans Admin
3. Admin appelle / envoie un email au patient pour confirmer
4. Après la séance, Admin marque « Séance réalisée »
5. Le patient voit la progression dans son espace

### Flouci
Endpoint `/api/payment/create` prêt.  
À brancher avec vos clés API Flouci (https://flouci.com).

## Structure

```
cabinet-zormati-site/
├── index.html          # Accueil
├── rdv.html            # Demande RDV
├── patient/            # Espace patient
├── admin/              # Espace admin
├── js/api.js           # Client API
├── js/chatbot.js       # Chatbot
├── server.js           # Backend Express
└── data/db.json        # Base de données
```
