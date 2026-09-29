// Intelligent Chatbot for Cabinet Zormati Athar
(function() {
  const knowledge = {
    services: {
      'rééducation fonctionnelle': "La rééducation fonctionnelle vise à récupérer la mobilité et la force après une blessure, une chirurgie ou une immobilisation. Athar établit un programme personnalisé adapté à votre situation.",
      'rééducation neurologique': "La rééducation neurologique accompagne les patients ayant subi un AVC, atteints de sclérose en plaques, de Parkinson ou d'autres pathologies neurologiques. L'objectif est d'améliorer l'autonomie et la qualité de vie.",
      'rééducation respiratoire': "La rééducation respiratoire améliore la fonction pulmonaire, aide au drainage bronchique et accompagne la récupération post-opératoire (après chirurgie thoracique par exemple).",
      'drainage lymphatique': "Le drainage lymphatique est une technique douce et rythmée qui stimule la circulation de la lymphe. Il réduit les œdèmes, favorise la détoxification et procure une sensation de légèreté.",
      'amincissement': "Les soins d'amincissement combinent techniques manuelles et approches ciblées pour remodeler et raffermir la silhouette de manière harmonieuse.",
      'pathologie du sport': "Athar accompagne les sportifs de tous niveaux : prévention des blessures, traitement des pathologies sportives et retour progressif à la performance."
    },
    packs: "Nous proposons 3 packs :\n• Pack 5 séances (Découverte) — idéal pour un premier bilan\n• Pack 10 séances (Progression) — le plus choisi, bon équilibre\n• Pack 15 séances (Intensif) — pour un parcours long\nPlus le pack est important, plus le tarif unitaire est avantageux.",
    contact: "Vous pouvez nous joindre au 52 023 685 ou par email : Atharzormati1@gmail.com\nAdresse : Rue Constantine 4059, Sousse Corniche, Tunisie.\nLe cabinet propose aussi des soins à domicile.",
    rdv: "Pour prendre rendez-vous, cliquez sur « Prendre RDV » ou allez sur la page de demande. Remplissez le formulaire avec votre nom, email et téléphone. Athar vous contactera rapidement pour confirmer le créneau.",
    horaires: "Les rendez-vous sont sur mesure pour s'adapter à votre emploi du temps. Contactez-nous pour trouver le créneau qui vous convient.",
    lieu: "Les soins se font au cabinet (Rue Constantine, Sousse Corniche) ou à domicile selon votre préférence et votre situation.",
    prix: "Les tarifs dépendent du type de soin et du pack choisi. Pour connaître les tarifs exacts, Athar vous les communiquera lors de la confirmation de votre rendez-vous. Les packs offrent des tarifs plus avantageux."
  };

  function getResponse(msg) {
    const t = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Greetings
    if (/^(bonjour|salut|hello|bonsoir|hey|hi)\b/.test(t)) {
      return "Bonjour ! Je suis l'assistant du Cabinet Zormati Athar. Comment puis-je vous aider ? Vous pouvez me demander des infos sur les services, les packs, comment prendre RDV, l'adresse...";
    }

    // Services
    for (const [key, val] of Object.entries(knowledge.services)) {
      if (t.includes(key) || t.includes(key.split(' ')[0])) return val;
    }
    if (/service|soin|traitement|reeducation|kine|kinesi/.test(t)) {
      return "Le cabinet propose :\n• Rééducation fonctionnelle\n• Rééducation neurologique\n• Rééducation respiratoire\n• Drainage lymphatique\n• Amincissement\n• Pathologie du sport\n\nDemandez-moi plus de détails sur un soin précis !";
    }

    // Packs
    if (/pack|forfait|seance|séance|tarif|prix|combien/.test(t)) {
      if (/prix|tarif|combien|cout|coût/.test(t)) return knowledge.prix;
      return knowledge.packs;
    }

    // RDV
    if (/rdv|rendez-vous|rendez vous|prendre|reserver|réserver|booking|disponible/.test(t)) {
      return knowledge.rdv;
    }

    // Contact / Address
    if (/contact|telephone|téléphone|email|mail|adresse|ou|où|localisation|sousse/.test(t)) {
      return knowledge.contact;
    }

    // Horaires
    if (/horaire|ouvert|quand|heure/.test(t)) return knowledge.horaires;

    // Lieu / domicile
    if (/domicile|cabinet|lieu|chez moi/.test(t)) return knowledge.lieu;

    // Athar
    if (/athar|zormati|qui|docteur|therapeute/.test(t)) {
      return "Athar Zormati est kinésithérapeute diplômée. Elle pratique au cabinet situé à Sousse Corniche et propose également des soins à domicile. Elle accompagne chaque patient avec une approche personnalisée et humaine.";
    }

    // Default
    return "Je peux vous renseigner sur :\n• Les services proposés\n• Les packs de séances\n• Comment prendre rendez-vous\n• L'adresse et les contacts\n• Les soins à domicile\n\nQue souhaitez-vous savoir ?";
  }

  const toggle = document.getElementById('chatbot-toggle');
  const win = document.getElementById('chatbot-window');
  const chatIcon = document.getElementById('chat-icon');
  const closeIcon = document.getElementById('close-icon');
  const messages = document.getElementById('chat-messages');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');

  if (!toggle) return;

  let opened = false;

  function addMsg(text, type) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + type;
    div.innerHTML = text.replace(/\n/g, '<br>');
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  toggle.addEventListener('click', () => {
    opened = !opened;
    win.classList.toggle('hidden', !opened);
    chatIcon.classList.toggle('hidden', opened);
    closeIcon.classList.toggle('hidden', !opened);
    if (opened && messages.children.length === 0) {
      addMsg("Bonjour ! 👋 Je suis l'assistant du Cabinet Zormati Athar. Posez-moi vos questions sur les soins, les packs ou pour prendre rendez-vous.", 'bot');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMsg(text, 'user');
    input.value = '';
    setTimeout(() => {
      addMsg(getResponse(text), 'bot');
    }, 400 + Math.random() * 400);
  });
})();
