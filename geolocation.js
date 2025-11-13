/** 
* @description Automatically retrieves and stores geolocation data for connected devices
* @author Jesse Techno
* @copyright 
* @license Apache-2.0
* @version v0.0.1
*/

module.exports.meshCentralPlugin = function(parent) {
    var obj = {};
    
    // Plugin information
    obj.pluginId = 'geolocation';
    obj.parent = parent;
    obj.meshServer = parent.parent;
    obj.common = parent.parent.common;
    
    // Plugin hooks
    obj.hooks = {
        'hook_processAgentData': processAgentData
    };
    
    /**
     * Process agent connection data to extract and store geolocation
     */
    function processAgentData(domain, node, agent, msg) {
        try {
            // Get the IP address from the agent connection
            var ip = null;
            if (agent && agent.remoteaddr) {
                ip = agent.remoteaddr;
                // Remove port if present
                if (ip.includes(':')) {
                    ip = ip.split(':')[0];
                }
            }
            
            if (ip && isPublicIP(ip)) {
                // Fetch geolocation data
                getGeolocation(ip, function(geoData) {
                    if (geoData) {
                        // Store geolocation in node data
                        if (!node.geolocation) {
                            node.geolocation = {};
                        }
                        
                        node.geolocation.ip = ip;
                        node.geolocation.country = geoData.country;
                        node.geolocation.region = geoData.region;
                        node.geolocation.city = geoData.city;
                        node.geolocation.lat = geoData.lat;
                        node.geolocation.lon = geoData.lon;
                        node.geolocation.lastUpdate = Date.now();
                        
                        // Save to database
                        obj.meshServer.db.Set(node);
                        
                        console.log(`Geolocation updated for node ${node.name}: ${geoData.city}, ${geoData.country}`);
                    }
                });
            }
        } catch (ex) {
            console.log('Geolocation plugin error:', ex);
        }
    }
    
    /**
     * Check if IP is public (not private/local)
     */
    function isPublicIP(ip) {
        if (!ip) return false;
        
        // Check for private IP ranges
        var parts = ip.split('.');
        if (parts.length !== 4) return false;
        
        var first = parseInt(parts[0]);
        var second = parseInt(parts[1]);
        
        // 10.0.0.0/8
        if (first === 10) return false;
        
        // 172.16.0.0/12
        if (first === 172 && second >= 16 && second <= 31) return false;
        
        // 192.168.0.0/16
        if (first === 192 && second === 168) return false;
        
        // 127.0.0.0/8 (localhost)
        if (first === 127) return false;
        
        return true;
    }
    
    /**
     * Get geolocation data from IP address using ip-api.com
     */
    function getGeolocation(ip, callback) {
        const https = require('https');
        
        const url = `https://ipapi.co/${ip}/json/`;
        
        https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    
                    if (parsed.error) {
                        console.log('Geolocation API error:', parsed.reason);
                        callback(null);
                        return;
                    }
                    
                    callback({
                        country: parsed.country_name || 'Unknown',
                        region: parsed.region || 'Unknown',
                        city: parsed.city || 'Unknown',
                        lat: parsed.latitude || 0,
                        lon: parsed.longitude || 0
                    });
                } catch (ex) {
                    console.log('Failed to parse geolocation data:', ex);
                    callback(null);
                }
            });
        }).on('error', (err) => {
            console.log('Geolocation request error:', err);
            callback(null);
        });
    }
    
    /**
     * Server startup hook
     */
    obj.serveraction = function() {
        console.log('Geolocation plugin started');
    };
    
    return obj;
};
