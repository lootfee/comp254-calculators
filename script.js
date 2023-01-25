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



function calculateBorrowedBitsFromSubnet(neededSubnets) {
    // Get the number of subnet bits needed
    var borrowedBits = Math.ceil(Math.log2(neededSubnets));
    return borrowedBits;
}

function calculateBorrowedBitsFromHost(ip, neededHost) {
    var defaultSubnetMask = getSlashNotation(ip)
    // Get the number of subnet bits needed
    var borrowedBits = 32 - defaultSubnetMask - Math.ceil(Math.log2(neededHost));
    console.log("log", Math.log2(neededHost))
    console.log("defaultSubnetMask", defaultSubnetMask - Math.ceil(Math.log2(neededHost)))
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
    var newGrid = new gridjs.Grid({ 
        columns: ['Network Address', 'Useable Range', 'Broadcast Address'],
        data: [[]], 
        pagination: {
            limit: 10,
            summary: true
          }
      }).render(document.getElementById('table-container'));
    var totalSubnets = subnetsAndHosts.totalSubnets;
    var networkAddressList = ip.split(".");
    
    var data = [];
    for (var i = 0; i < totalSubnets; i++) {
        var networkAddress = networkAddressList.join(".");
        var firstHost = parseInt(networkAddressList[3]) + 1;
        var firstHostAddress = networkAddressList.slice(0, -1).join(".") + "." + firstHost;

        var lastHost = parseInt(networkAddressList[3]) + subnetsAndHosts.usableHosts;
        
        if (lastHost > 255){
            networkAddressList[2] = parseInt(networkAddressList[2]) + Math.floor(lastHost / 255) - 1;
            lastHost = 254;
        }
        if (networkAddressList[2] > 255){
            networkAddressList[1] = parseInt(networkAddressList[1]) + Math.floor(networkAddressList[2] / 255) - 1;
            networkAddressList[2] = 255;
        }
        
        
        var lastHostAddress = networkAddressList.slice(0, -1).join(".") + "." + lastHost;
        var broadcastAddress = networkAddressList.slice(0, -1).join(".") + "." + (lastHost + 1);
        
        data.push([networkAddress, firstHostAddress + " - " + lastHostAddress, broadcastAddress]);
        console.log([networkAddress, firstHostAddress + " - " + lastHostAddress, broadcastAddress]);
        
        networkAddressList[3] = lastHost + 2;

        if (lastHost + 2 > 255){
            networkAddressList[2] = parseInt(networkAddressList[2]) + 1;
            networkAddressList[3] = 0;
        }
        
        if (parseInt(networkAddressList[2]) > 255){
            networkAddressList[1] = parseInt(networkAddressList[1]) + 1;
            networkAddressList[2] = 0;
            networkAddressList[3] = 0;
        }
        
        if (parseInt(networkAddressList[1]) > 255){
            networkAddressList[0] = parseInt(networkAddressList[0]) + 1;
            networkAddressList[1] = 0;
            networkAddressList[2] = 0;
            networkAddressList[3] = 0;
        }
    }
    
    newGrid.updateConfig({ 
        data: data, 
    }).forceRender();
}



document.getElementById("calculate").addEventListener('click', function (e) {
    document.getElementById("table-container").innerHTML = "";
    var ip = document.getElementById("network-address").value;
    var neededSubnets = document.getElementById("needed-subnets").value;
    var neededUseableHosts = document.getElementById("needed-useable-hosts").value;
    var borrowedBits;
    if (neededSubnets.trim().length > 0){
        borrowedBits = calculateBorrowedBitsFromSubnet(neededSubnets);
        document.getElementById("needed-useable-hosts").value = "";
    }
    else if (neededUseableHosts.trim().length > 0){
        borrowedBits = calculateBorrowedBitsFromHost(ip, neededUseableHosts);
        document.getElementById("needed-subnets").value = "";
    }
    
    var ipClass =  getIPClass(ip);
    var subnetMasks = getSubnetMask(ip, borrowedBits);
    var subnetsAndHosts = calculateSubnetsAndHosts(ip, borrowedBits);
    document.getElementById("address-class").innerText = ipClass;
    document.getElementById("default-subnet-mask").innerText = subnetMasks.defaultSubnetMask + " (/" + subnetMasks.prefixNotation + ")";
    document.getElementById("custom-subnet-mask").innerText = subnetMasks.customSubnetMask;
    document.getElementById("total-subnets").innerText = subnetsAndHosts.totalSubnets;
    document.getElementById("total-host-address").innerText = subnetsAndHosts.totalHosts;
    document.getElementById("useable-hosts").innerText = subnetsAndHosts.usableHosts;
    document.getElementById("bits-borrowed").innerText = borrowedBits;
    createSubnetTable(ip, subnetsAndHosts);
    //document.getElementById("table-container").innerHTML = createSubnetTable(ip, subnetsAndHosts);
});