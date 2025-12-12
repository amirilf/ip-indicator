const { Soup } = imports.gi;

var API_PROVIDERS = [
  {
    name: "ip-api.com",
    url: "http://ip-api.com/json/?fields=query,countryCode",
    parseResponse: (data) => ({ ip: data.query, country: data.countryCode }),
  },
  {
    name: "ipapi.co",
    url: "https://ipapi.co/json/",
    parseResponse: (data) => ({ ip: data.ip, country: data.country }),
  },
  {
    name: "ipify + ip-api",
    url: "https://api.ipify.org?format=json",
    parseResponse: async (data, session) => {
      const ip = data.ip;
      try {
        const countryData = await fetchFromAPI(session, `http://ip-api.com/json/${ip}?fields=countryCode`);
        return { ip, country: countryData.countryCode };
      } catch {
        return { ip, country: null };
      }
    },
  },
  {
    name: "ip.sb",
    url: "https://api.ip.sb/geoip",
    parseResponse: (data) => ({ ip: data.ip, country: data.country_code }),
  },
  {
    name: "ipwho.is",
    url: "https://ipwho.is/",
    parseResponse: (data) => ({ ip: data.ip, country: data.country_code }),
  },
  {
    name: "ip-api.io",
    url: "https://ip-api.io/json/",
    parseResponse: (data) => ({ ip: data.ip, country: data.country_code }),
  },
  {
    name: "geojs.io",
    url: "https://get.geojs.io/v1/ip/geo.json",
    parseResponse: (data) => ({ ip: data.ip, country: data.country_code }),
  },
];

function fetchFromAPI(session, url) {
  return new Promise((resolve, reject) => {
    const msg = Soup.Message.new("GET", url);

    session.queue_message(msg, (sess, response) => {
      try {
        if (response.status_code !== 200) {
          reject(new Error(`HTTP ${response.status_code}`));
          return;
        }
        resolve(JSON.parse(response.response_body.data));
      } catch (err) {
        reject(err);
      }
    });
  });
}

function getLocalIP() {
  const { GLib } = imports.gi;

  try {
    const [success, output] = GLib.spawn_command_line_sync("hostname -I");
    if (!success) return null;

    const decoder = new TextDecoder("utf-8");
    const ipList = decoder.decode(output).trim().split(" ");
    return ipList[0] || null;
  } catch {
    return null;
  }
}
