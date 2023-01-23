function getIPClass(ip) {
    // Extract the first octet of the IP address
    var firstOctet = parseInt(ip.split(".")[0]);

    if (firstOctet >= 1 && firstOctet <= 127) {
        return "Class A";
    } else if (firstOctet >= 128 && firstOctet <= 191) {
        return "Class B";
    } else if (firstOctet >= 192 && firstOctet <= 223) {
        return "Class C";
    } else if (firstOctet >= 224 && firstOctet <= 239) {
        return "Class D";
    } else if (firstOctet >= 240 && firstOctet <= 255) {
        return "Class E";
    } else {
        return "Invalid IP address";
    }
}


function calculateBorrowedBits(neededSubnets) {
    // Get the number of subnet bits needed
    var borrowedBits = Math.ceil(Math.log2(neededSubnets));
    return borrowedBits;
}


function getSubnetMask(ip, borrowedBits) {
    // Get the address class of the IP address
    var addressClass = getIPClass(ip);
    // Get the default subnet mask for the address class
    var defaultSubnetMask;
    if (addressClass == "Class A") {
        defaultSubnetMask = "255.0.0.0";
    } else if (addressClass == "Class B") {
        defaultSubnetMask = "255.255.0.0";
    } else if (addressClass == "Class C") {
        defaultSubnetMask = "255.255.255.0";
    }
    // // Convert the default subnet mask to binary
    var defaultOctets = defaultSubnetMask.split(".");

    var customSubnetMask = "";
    var bits;
    var bitTotal;
    var borrowedBitsClone = borrowedBits;
    for (var i = 0; i <= defaultOctets.length; i++) {
        var bits = 128;
        var bitTotal = 0;
        if (parseInt(defaultOctets[i]) == 255){
            customSubnetMask += "255."
        }
        else if (parseInt(defaultOctets[i]) == 0){
            for (var j = 0; j < borrowedBits; j++) {
                if (bitTotal < 255 && borrowedBitsClone > 0){
                    bitTotal += bits;
                    bits /= 2;
                    borrowedBitsClone -= 1;
                }
                else {
                    break;
                }
            }
            customSubnetMask += bitTotal + ".";
        }
    }
    customSubnetMask = customSubnetMask.slice(0, -1);
    // Get the prefix notation
    var prefixNotation = getSlashNotation(ip);
    // Return the subnet mask in both notations
    return { "customSubnetMask": customSubnetMask, "prefixNotation": prefixNotation , "defaultSubnetMask": defaultSubnetMask};
}


function getSlashNotation(ip){
    // Get the address class of the IP address
    var addressClass = getIPClass(ip);
    // Get the default subnet mask for the address class
    var defaultSubnetMask;
    if (addressClass == "Class A") {
        defaultSubnetMask = 8;
    } else if (addressClass == "Class B") {
        defaultSubnetMask = 16;
    } else if (addressClass == "Class C") {
        defaultSubnetMask = 24;
    }
    return defaultSubnetMask;
}


function calculateSubnetsAndHosts(ip, borrowedBits) {
    // Get the default subnet mask for the address class
    var defaultSubnetMask = getSlashNotation(ip);
    // Calculate the total number of subnets
    var totalSubnets = Math.pow(2, borrowedBits);
    // Calculate the total number of host addresses
    var totalHosts = Math.pow(2, 32 - defaultSubnetMask - borrowedBits)//Math.pow(2, hostBits + borrowedBits);
    
    // Calculate the number of usable host addresses
    var usableHosts = totalHosts - 2;
    return { "totalSubnets": totalSubnets, "totalHosts": totalHosts, "usableHosts": usableHosts };
}


function createSubnetTable(ip, subnetsAndHosts) {
    // Get the number of subnets
    var totalSubnets = subnetsAndHosts.totalSubnets;
    if (totalSubnets > 10){
        totalSubnets = 10;
    }
    // Create the table
    var table = "<table class='table table-bordered'><tr><th>Network Address</th><th>Usable Range</th><th>Broadcast Address</th></tr>";
    var networkAddressList = ip.split(".");
    var networkAddressFirst = networkAddressList.slice(0, -1);
    var networkAddressLast = parseInt(networkAddressList.at(-1));
    console.log("networkAddressLast " + networkAddressList.at(-1))

    for (var i = 0; i < totalSubnets; i++) {
            // Add a row to the table
            var networkAddress = networkAddressFirst.join(".") + "." + networkAddressLast;
            var firstHost = networkAddressLast + 1;
            var lastHost = networkAddressLast + subnetsAndHosts.usableHosts;
            var firstHostAddress = networkAddressFirst.join(".") + "." + firstHost;
            var lastHostAddress = networkAddressFirst.join(".") + "." + lastHost;
            var broadcastAddress = networkAddressFirst.join(".") + "." + (lastHost + 1);
            table += "<tr><td>" + networkAddress + "</td><td>" + firstHostAddress + " - " + lastHostAddress + "</td><td>" + broadcastAddress + "</td></tr>";
            networkAddressLast = lastHost + 2;
            
        }
    table += "</table>";
    return table;
}


document.getElementById("calculate").addEventListener('click', function (e) {
    document.getElementById("table-container").innerHTML = "";
    var ip = document.getElementById("network-address").value;
    var neededSubnets = document.getElementById("needed-subnets").value;
    var neededUseableHosts = document.getElementById("needed-useable-hosts").value;
    var borrowedBits = calculateBorrowedBits(neededSubnets);
    var ipClass =  getIPClass(ip);
    var subnetMasks = getSubnetMask(ip, borrowedBits);
    var subnetsAndHosts = calculateSubnetsAndHosts(ip, borrowedBits, neededUseableHosts);
    document.getElementById("address-class").innerText = ipClass;
    document.getElementById("default-subnet-mask").innerText = subnetMasks.defaultSubnetMask + " (/" + subnetMasks.prefixNotation + ")";
    document.getElementById("custom-subnet-mask").innerText = subnetMasks.customSubnetMask;
    document.getElementById("total-subnets").innerText = subnetsAndHosts.totalSubnets;
    document.getElementById("total-host-address").innerText = subnetsAndHosts.totalHosts;
    document.getElementById("useable-hosts").innerText = subnetsAndHosts.usableHosts;
    document.getElementById("bits-borrowed").innerText = borrowedBits;

    document.getElementById("table-container").innerHTML = createSubnetTable(ip, subnetsAndHosts);
});