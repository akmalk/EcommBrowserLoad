var exports = module.exports = {};
var _ = require('lodash');

exports.getSessionData = function() {
    return {
        geo : getGeo(),
        browser : getBrowser()
    };
}

var getGeo = function() {
    var geos = [
        { c: 'United Kingdom', r: 'Bolton', t: 'Horwich' },
        { c: 'United Kingdom', r: 'Brighton and Hove', t: 'Brighton' },
        { c: 'United Kingdom', r: 'East Sussex', t: 'Peacehaven' },
        { c: 'United Kingdom', r: 'West Sussex', t: 'Worthing' },
        { c: 'United Kingdom', r: 'Greater London', t: 'Bromley' },
        { c: 'United Kingdom', r: 'Kent', t: 'Swanley' },
        { c: 'United Kingdom', r: 'City of Bristol', t: 'Bristol' },
        { c: 'United Kingdom', r: 'South Gloucestershire', t: 'Kingswood' },
        { c: 'United Kingdom', r: 'North Somerset', t: 'Portbury' },
        { c: 'United Kingdom', r: 'Castlereagh', t: 'Dundonald' },
        { c: 'United Kingdom', r: 'Lisburn', t: 'Dunmurry' },
        { c: 'United Kingdom', r: 'North Down', t: 'Holywood' },
        { c: 'United Kingdom', r: 'Ards', t: 'Donaghadee' },
        { c: 'United Kingdom', r: 'Down', t: 'Newcastle' },


        {c : 'United States', r : 'Washington', t : 'Tacoma' },
        {c : 'United States', r : 'California', t : 'San Francisco' },
        {c : 'United States', r : 'Nevada', t : 'Reno' },
        {c : 'United States', r : 'Texas', t : 'Dallas' },
        {c : 'United States', r : 'Oregon', t : 'Portland' },
        {c : 'United States', r : 'Colorado', t : 'Denver' },
        {c : 'United States', r : 'Nebraska', t : 'Omaha' },
        {c : 'United States', r : 'Florida', t : 'Tampa' },
        {c : 'United States', r : 'New York', t : 'New York City' },
        {c : 'United States', r : 'Idaho', t : 'Boise' },
        {c : 'United States', r : 'Montana', t : 'Bozeman' },
        {c : 'United States', r : 'Utah', t : 'Salt Lake City' },
        {c : 'United States', r : 'New Mexico', t : 'Santa Fe' },
        {c : 'United States', r : 'Arizona', t : 'Phoenix' },
        {c : 'United States', r : 'Oklahoma', t : 'Oklahoma City' },
        {c : 'United States', r : 'Kansas', t : 'Toto' },
        {c : 'United States', r : 'Nebraska', t : 'Lincoln' },
        {c : 'United States', r : 'South Dakota', t : 'Pierre' },
        {c : 'United States', r : 'Minnesota', t : 'St. Paul' },
        {c : 'United States', r : 'Missouri', t : 'Jefferson City' },
        {c : 'United States', r : 'Arkansas', t : 'Little Rock' },
        {c : 'United States', r : 'Alabama', t : 'Montgomery' },
        {c : 'United States', r : 'Kentucky', t : 'Frankfort' },
        {c : 'United States', r : 'South Carolina', t : 'Columbia' },
        {c : 'United States', r : 'New Jersey', t : 'Trenton' },
        {c : 'United States', r : 'Maine', t : 'Augusta' },

        {c : 'France', r : 'Alsace', t : 'Strasbourg' },
        {c : 'France', r : 'Aquitaine', t : 'Bordeaux' },
        {c : 'France', r : 'Auvergne', t : 'Clermont-Ferrand' },
        {c : 'France', r : 'Bretagne', t : 'Rennes' },
        {c : 'France', r : 'Bourgogne', t : 'Dijon' },
        {c : 'France', r : 'Centre-Val de Loire', t : 'Orleans' },
        {c : 'France', r : 'Champagne-Ardenne', t : '	Chalons-en-Champagne' },
        {c : 'France', r : 'Franche-Comte', t : 'Besancon' },
        {c : 'France', r : 'Ile-de-France', t : 'Paris' },
        {c : 'France', r : 'Languedoc-Roussillon', t : 'Montpellier' },
        {c : 'France', r : 'Limousin', t : 'Limoges' },
        {c : 'France', r : 'Lorraine', t : 'Metz' },
        {c : 'France', r : 'Basse-Normandie', t : 'Caen' },
        {c : 'France', r : 'Midi-Pyrenees', t : 'Toulouse' },
        {c : 'France', r : 'Nord-Pas-de-Calais', t : 'Lille' },
        {c : 'France', r : 'Pays de la Loire', t : 'Nantes' },
        {c : 'France', r : 'Picardie', t : 'Amiens' },
        {c : 'France', r : 'Poitou-Charentes', t : 'Poitiers' },
        {c : 'France', r : 'Rhone-Alpes', t : 'Lyon' },
        {c : 'France', r : 'Haute-Normandie', t : 'Rouen' },

        {c : 'Canada', r : 'British Columbia', t : 'Vancouver' },
        {c : 'Canada', r : 'Alberta', t : 'Calgary' },
        {c : 'Canada', r : 'Yukon Territory', t : 'Whitehorse' },
        {c : 'Canada', r : 'Northwest Territory', t : 'Yellow Knife' },
        {c : 'Canada', r : 'Saskatchewan', t : 'Regina' },
        {c : 'Canada', r : 'Manitoba', t : 'Winnipeg' },
        {c : 'Canada', r : 'Ontario', t : 'Toronto' },
        {c : 'Canada', r : 'Quebec', t : 'Montreal' },
        {c : 'Canada', r : 'Newfoundland', t : 'St-Johns' },

        {c : 'Spain', r : 'Madrid', t : 'Madrid' },
        {c : 'Portugal', r : 'Lisboa', t : 'Lisbon' },
        {c : 'Germany', r : 'Hessen', t : 'Frankfurt' },
        {c : 'Italy', r : 'Toscana', t : 'Florence' },
        {c : 'Poland', r : 'Warsaw', t : 'Warsaw' },
        {c : 'Czech Republic', r : 'Prague', t : 'Prague' },
        {c : 'Greece', r : 'Athens', t : 'Athens' },
        {c : 'Romania', r : 'Bucharest', t : 'Bucharest' },
        {c : 'Ireland', r : 'Dublin', t : 'Dublin' },

        {c : 'Morocco', r : 'Fez', t : 'Fez' },
        {c : 'South Africa', r : 'Cape Town', t : 'Cape Town' },
        {c : 'Egypt', r : 'Cairo', t : 'Cairo' },

        {c : 'Mexico', r : 'Mexico City', t : 'Mexico City' },
        {c : 'Panama', r : 'Panama City', t : 'Panama City' },
        {c : 'Colombia', r : 'Cundinamarca', t : 'Bogota' },
        {c : 'Chile', r : 'r IV', t : 'Santiago' },
        {c : 'Argentina', r : 'Buenos Aires', t : 'Buenos Aires' },
        {c : 'Peru', r : 'Lima', t : 'Lima' },

        {c : 'Brazil', r : 'Amazonas', t : 'Manaus' },
        {c : 'Brazil', r : 'Bahia', t : 'Salvador' },
        {c : 'Brazil', r : 'Mato Grosso', t : 'Cuiaba' },
        {c : 'Brazil', r : 'Rio de Janeiro', t : 'Rio de Janeiro' },
        {c : 'Brazil', r : 'Sao Paulo', t : 'Sao Paulo' },

        {c : 'Russian Federation', r : 'Kamchatka', t : 'Fedotyev' },
        {c : 'Russian Federation', r : 'Vologda', t : 'Vologda' },
        {c : 'Russian Federation', r : 'Krasnoyarsk', t : 'Krasnoyarsk' },

        {c : 'China', r : 'Hebei', t : 'Beijing' },
        {c : 'China', r : 'Yunnan', t : 'Kunming' },
        {c : 'China', r : 'Hubei', t : 'Wuhan' },

        {c : 'Japan', r : 'Hokkaido', t : 'Sapporo' },
        {c : 'Japan', r : 'Tokyo', t : 'Tokyo' },

        {c : 'India', r : 'Maharashtra', t : 'Mumbai' },
        {c : 'India', r : 'Kerala', t : 'Thiruvananthapuram' },
        {c : 'India', r : 'Rajasthan', t : 'Jaipur' },

        {c : 'Australia', r : 'Victoria', t : 'Melbourne' },
        {c : 'Australia', r : 'South Australia', t : 'Adelaide' },
        {c : 'Australia', r : 'New South Wales', t : 'Sydney' },
        {c : 'Australia', r : 'Queensland', t : 'Brisbane' },

    ];
    var geo =  geos[_.random(0, (geos.length - 1))];
    return geo;
}

var getBrowser = function() {
    var userAgents = [

        {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/36.0.1985.125 Chrome/36.0.1985.125 Safari/537.36'},
        {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1'},
        {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0'},
        {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0'},
        {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'},
        {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36'},
        {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.3319.102 Safari/537.36'},
        {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'},
        {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)'},
        {storage : true, timing : 'nav', agent : 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_2_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13D15 Safari/601.1'},
        {storage : true, timing : 'nav', agent : 'Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))'},

        {storage : true, timing : 'none', agent : 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0; InfoPath.1; SV1; .NET CLR 3.8.36217; WOW64; en-US)'},
        {storage : false, timing : 'none', agent : 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP)'},

        {storage : false, timing : 'none', agent : 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10'},
        {storage : false, timing : 'none', agent : 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25'}

    ];

    return userAgents[_.random(0, (userAgents.length - 1))];
}