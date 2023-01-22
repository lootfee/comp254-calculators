function decimalToBinary(val){
    let binaryNumber = "";
    while (val > 0) {
        let x = val % 2;
        if (x > 0) {
            binaryNumber += "1";
        } else {
            binaryNumber += "0";
        }
        val = Math.floor(val / 2);
    }
    let y = binaryNumber.split("").reverse().join("");
    return y;
}


function hexadecimalToDecimal(val){
    let hexadecimals = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    let decimals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    let vals = val.split("");
    console.log(vals);
    let decimalValue = 0;
    for (let i = (vals.length - 1); i >= 0; i--) {
        let hexValIndex = hexadecimals.indexOf(vals[i].toUpperCase());
        let x = decimals[hexValIndex] * Math.pow(16, (vals.length - 1 - i));
        decimalValue += decimals[hexValIndex] * Math.pow(16, (vals.length - 1 - i));
        console.log("hexValIndex " + decimals[hexValIndex] + " " + (vals.length - 1 - i) + " " + x + " " + decimalValue);
    }
    return decimalValue;
}


// Function to convert binary to decimal
function binaryToDecimal(binary) {
    let decimal = 0;
    let power = 0;
    for (let i = binary.length - 1; i >= 0; i--) {
        let digit = binary[i];
        decimal += digit * (Math.pow(2, power));
        power++;
    }
    return decimal;
}

// Function to convert decimal to hexadecimal
function decimalToHexadecimal(decimal) {
    let hex = "";
    let remainder;
    while (decimal > 0) {
        remainder = decimal % 16;
        decimal = Math.floor(decimal / 16);
        if (remainder < 10) {
        hex = remainder + hex;
        } else {
        hex = String.fromCharCode(remainder + 55) + hex;
        }
    }
    return hex;
}


document.getElementById("calculatebinaries").addEventListener('click', function (e) {
    let decimalVal;
    let binaryVal;
    let hexVal;
    if (document.getElementById("decimal").value.length > 0){
        decimalVal = document.getElementById("decimal").value;
        decimalVal = parseInt(decimalVal);
        binaryVal = decimalToBinary(decimalVal);
        document.getElementById("binary").value = binaryVal;
        hexVal = decimalToHexadecimal(decimalVal);
        document.getElementById("hexadecimal").value = hexVal;
    }
    else if (document.getElementById("binary").value.length > 0){
        binaryVal = document.getElementById("binary").value;
        //binaryVal = parseInt(binaryVal);
        console.log(binaryVal);
        decimalVal = binaryToDecimal(binaryVal);
        document.getElementById("decimal").value = decimalVal;
        hexVal = decimalToHexadecimal(decimalVal);
        document.getElementById("hexadecimal").value = hexVal;
    }
    else if (document.getElementById("hexadecimal").value.length > 0){
        hexVal = document.getElementById("hexadecimal").value;
        decimalVal = hexadecimalToDecimal(hexVal);
        document.getElementById("decimal").value = decimalVal;
        binaryVal = decimalToBinary(decimalVal);
        document.getElementById("binary").value = binaryVal;
    }
});


document.getElementById("clear").addEventListener('click', function (e) {
    document.getElementById("binary").value = "";
    document.getElementById("decimal").value = "";
    document.getElementById("hexadecimal").value = "";
});