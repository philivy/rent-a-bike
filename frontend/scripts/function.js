 // Ajout local de parseFrenchNumber
 function parseFrenchNumber(numberString) {
  return parseFloat(numberString.replace(',', '.'));
}

function calculateCost(durationHours, prixHoraire, prixDemiJournee, prixJournee) {
  const TVA_RATE = 0.20;

  let tarifType, costHT;
  if (durationHours <= 2) {
    tarifType = "Horaire";
    costHT = prixHoraire * durationHours;
  } else if (durationHours <= 6) {
    tarifType = "Demi-journée";
    costHT = prixDemiJournee;
  } else {
    tarifType = "Journée";
    costHT = prixJournee * Math.ceil(durationHours / 24);
  }

  const costTTC = costHT * (1 + TVA_RATE);

  return {
    tarifType: tarifType,
    costHT: costHT,
    tva: costHT * TVA_RATE,
    costTTC: costTTC
  };
}

function formatFrenchNumber(number) {
  if (typeof number !== 'number' || isNaN(number)) return 'N/A';
  return number.toFixed(2).replace('.', ',');
}

// Exposer dans l’espace global
window.calculateCost = calculateCost;
window.formatFrenchNumber = formatFrenchNumber;
