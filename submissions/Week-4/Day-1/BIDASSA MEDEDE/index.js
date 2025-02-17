let numero = prompt("enter the number");
function verifierCarteBancaire(numeroCarte) {
    let chiffres = numeroCarte.replace(/\s+/g, '').split('').map(Number);
    if (chiffres.some(isNaN)) {
        console.log("Numéro invalide : contient des caractères non numériques.");
        return false;
    }
    let sommeTotale = 0;
    let doubler = false; 
    for (let i = chiffres.length - 1; i >= 0; i--) {
        let chiffre = chiffres[i];
        if (doubler) {
            chiffre *= 2;
            if (chiffre > 9) {
                chiffre = chiffre - 9; 
            }
        }
        sommeTotale += chiffre;
        doubler = !doubler; 
    }
    let estValide = (sommeTotale % 10 === 0);
    console.log(` Card number ${estValide ? "valid" : "invalid"}`);
    return estValide;
}
verifierCarteBancaire(numero);
