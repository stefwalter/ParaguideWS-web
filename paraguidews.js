/**
 * Check if the current URL contains the query parameter "?source=pwa", 
 * and if not, hide certain elements and fetch weather-related data.
 */
if (-1 === window.location.href.indexOf("?source=pwa")) {
    document.getElementById("addToHomeScreen").style.display = "block";
    document.getElementById("iinfo").style.display = "block";
    document.getElementById("tbrief").style.display = "none";
    document.getElementById("8hours").style.display = "none";
    document.getElementById("metar").style.display = "none";
    document.getElementById("windy").style.display = "none";
    document.getElementById("skewtc").style.display = "none";
    document.getElementById("meteogram").style.display = "none";
    document.getElementById("lnews").style.display = "none";
    document.getElementById("tobir").style.display = "none";
    document.getElementById("randomlink").style.display = "none";
}

if (prefersDarkScheme.matches) {
    document.body.classList.remove("light-theme");
} else {
    document.body.classList.add("light-theme");
}
/**
 * Fetches and displays the brief.
 */
fetch("longmet.json")
    .then(response => response.json())
    .then(data => {
        data = data.response[0].phrases.longMET;
        document.getElementById("longMET").textContent = data + " (In C).";
    })
    .catch(error => {
        console.error("Error fetching JSON:", error);
    });
/**
 * Fetches and displays the air quality index (AQI) information.
 */
fetch("aq.json")
    .then(response => response.json())
    .then(data => {
        var aqi = data.response[0].periods[0].aqi;
        var category = data.response[0].periods[0].category;
        document.getElementById("aqi").textContent = aqi;
        document.getElementById("aqic").textContent = category;
    })
    .catch(error => {
        console.error("Error fetching JSON:", error);
    });
        // Function to fetch JSON data and display news
        async function fetchAndDisplayNews() {
            try {
                const response = await fetch('news.json');
                const newsData = await response.json();
                
                const newsContainer = document.getElementById('news-container');

                newsData.forEach(newsItem => {
                    const newsItemElement = document.createElement('div');
                    newsItemElement.classList.add('news-item');
                    newsItemElement.innerHTML = `
                        <p>&bull;&nbsp;<a href="${newsItem.link}" class="news-link" target="_blank">${newsItem.title}</a></p>
                    `;
                    newsContainer.appendChild(newsItemElement);
                });
            } catch (error) {
                console.error('Error fetching news:', error);
            }
        }

        // Call the function to fetch and display news
        fetchAndDisplayNews();

        // Call the function to fetch and display news
        fetchAndDisplayNews();
/**
 * Fetches data from open-meteo and displays it on the webpage.
 */
fetch("https://api.open-meteo.com/v1/forecast?latitude=32.036973&longitude=76.708624&hourly=cloud_cover,visibility,direct_radiation,uv_index,uv_index_clear_sky,cape&daily=sunrise,sunset,sunshine_duration,precipitation_hours,precipitation_probability_max&timezone=Asia/Kolkata&forecast_days=1&models=gfs_seamless")
    .then(response => response.json())
    .then(data => {
        const date = new Date();
        var hour = date.getHours();
        var index = data.hourly.time.findIndex(time => parseInt(time.split("T")[1].split(":")[0]) === hour);
        const weatherForecast = document.getElementById("weatherForecast");

        for (let i = index; i < index + 8; i++) {
            var idx = i % data.hourly.time.length;
            const time = data.hourly.time[idx];
            var cloudCover = Math.round(data.hourly.cloud_cover[idx]);
            var visibility = Math.round(data.hourly.visibility[idx] / 1000);
            var uvIndex = Math.round(data.hourly.uv_index_clear_sky[idx]);
            var radiation = Math.round(data.hourly.direct_radiation[idx]);
            var cape = Math.round(data.hourly.cape[idx]);
            const row = weatherForecast.insertRow();
            row.insertCell(0).textContent = time.split("T")[1];
            row.insertCell(1).textContent = cloudCover;
            row.insertCell(2).textContent = visibility;
            row.insertCell(3).textContent = uvIndex;
            row.insertCell(4).textContent = radiation;
            row.insertCell(5).textContent = cape;
        }

        const sunrise = new Date(data.daily.sunrise[0]);
        sunrise.setMinutes(sunrise.getMinutes() - 30);
        const sunset = new Date(data.daily.sunset[0]);
        sunset.setMinutes(sunset.getMinutes() - 30);

        // Function to format date to HH:mm format
        function formatTime(date) {
            return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
        }

        const dailyForecast = document.getElementById("dailyForecast");
        var sunshineDuration = Math.round(data.daily.sunshine_duration[0] / 3600);
        var precipitationProbability = data.daily.precipitation_probability_max[0];
        dailyForecast.innerHTML = `
            <p>Sunrise: ${formatTime(sunrise)}</p>
            <p>Sunset: ${formatTime(sunset)}</p>
            <p>Sunshine Duration: ${sunshineDuration} hours</p>
            <p>Precipitation Probability: ${precipitationProbability}%</p>
        `;
    })
    .catch(error => console.error("Error fetching data:", error));
/**
 * Fetches current weather data and displays it on the webpage.
 */
const apiKey = "";
const stationID = "IBAIJN1";
const apiUrl = `https://api.weather.com/v2/pws/observations/current?stationId=${stationID}&format=json&units=m&apiKey=` + apiKey;

let isCelsius = true;

function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    fetchWeatherData();
}

async function fetchWeatherData() {
    try {
        // Fetching both weather data and minmax.txt file simultaneously
        const [weatherResponse, minmaxResponse] = await Promise.all([
            fetch(apiUrl), // Fetch weather data
            fetch('minmax.txt') // Fetch minmax.txt file
        ]);

        // Parsing weather data response
        const weatherData = await weatherResponse.json();
        const observation = weatherData.observations[0];
        let temperature = observation.metric.temp;
        let dewpt = observation.metric.dewpt;
        let humidity = observation.humidity;
        let pressure = observation.metric.pressure;

        if (!isCelsius) {
            temperature = (9 * temperature / 5) + 32;
            dewpt = (9 * dewpt / 5) + 32;
            pressure *= 0.02953;
        }

        var cloudBaseHeight = Math.round(125 * (temperature - dewpt) / 2.5);
        if (!isCelsius) {
            cloudBaseHeight = Math.round(3.28084 * cloudBaseHeight);
        }

        // Parsing minmax.txt file content
        const minmaxData = await minmaxResponse.text();
        const lines = minmaxData.split('\n');
        const values = lines[0].split(',');

        // Extracting mint and maxt from the values array
        let mint = parseFloat(values[2]); // Parsing string to float
        let maxt = parseFloat(values[3]); // Parsing string to float

        if (!isCelsius) {
            mint = (9 * mint / 5) + 32; // Converting mint to Fahrenheit
            maxt = (9 * maxt / 5) + 32; // Converting maxt to Fahrenheit
        }

        // Updating DOM elements with fetched data
        document.getElementById("cloudBaseHeight").textContent = cloudBaseHeight + (isCelsius ? " m" : " ft");
        document.getElementById("temperature").textContent = temperature.toFixed(2) + (isCelsius ? " °C" : " °F");
        document.getElementById("humidity").textContent = humidity + "%";
        document.getElementById("pressure").textContent = pressure.toFixed(2) + (isCelsius ? " hPa" : " inHg");
        document.getElementById("dewpt").textContent = dewpt.toFixed(2) + (isCelsius ? " °C" : " °F");
        document.getElementById("otime").textContent = observation.obsTimeLocal + " IST";
        document.getElementById("mint").textContent = mint.toFixed(2) + (isCelsius ? " °C" : " °F");
        document.getElementById("maxt").textContent = maxt.toFixed(2) + (isCelsius ? " °C" : " °F");
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}


/**
 * Fetches weather alerts and displays them on the webpage.
 */
let todayAlertsCount = 0;
let tomorrowAlertsCount = 0;

function fetchAlerts(url, containerId, sectionId) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                //  console.log("Fetch failed for: " + url);
                return null;
            }
            return response.text();
        })
        .then(text => {
            if (!text) return;
            const alerts = text.split("--").filter(item => !item.includes('"balloonText": "No warning"'));
            alerts.sort((a, b) => {
                const locations = ["KANGRA", "MANDI", "KULLU", "CHAMBA"];
                return locations.indexOf(getTitle(a)) - locations.indexOf(getTitle(b));
            });
            alerts.forEach(alert => {
                processAlert(alert, containerId);
            });
            const alertsCount = document.getElementById(containerId).children.length;
            if (containerId === 'todayAlerts') {
                todayAlertsCount = alertsCount;
            } else if (containerId === 'tomorrowAlerts') {
                tomorrowAlertsCount = alertsCount;
            }
            // console.log("Alerts count for", containerId + ":", alertsCount);
            updateSectionsVisibility();
        })
        .catch(error => {
            //  console.log("Fetch failed for: " + url);
            updateSectionsVisibility();
        });
}

function processAlert(alert, containerId) {
    const alertObject = JSON.parse(`{${alert}}`);
    if (!alertObject.balloonText.includes("No warning")) {
        const container = document.createElement("div");
        container.className = "alert-container";
        container.style.backgroundColor = alertObject.color;
        const content = document.createElement("div");
        content.innerHTML = removeTags(alertObject.balloonText);
        container.appendChild(content);
        document.getElementById(containerId).appendChild(container);
    }
}

function removeTags(text) {
    return text.replace(/<\/?br\/?>/g, "");
}

function getTitle(alert) {
    const match = alert.match(/"title":\s*"(.*?)"/);
    return match ? match[1] : "";
}

function updateSectionsVisibility() {
    const todaySection = document.getElementById("todaySection");
    const tomorrowSection = document.getElementById("tomorrowSection");
    const warningLegend = document.querySelector(".warning-legend");

    todaySection.style.display = todayAlertsCount > 0 ? "block" : "none";
    tomorrowSection.style.display = tomorrowAlertsCount > 0 ? "block" : "none";
    warningLegend.style.display = (todayAlertsCount + tomorrowAlertsCount) > 0 ? "flex" : "none";

    // console.log("Today alerts section visibility:", todaySection.style.display);
    // console.log("Tomorrow alerts section visibility:", tomorrowSection.style.display);
    // console.log("Warning legend visibility:", warningLegend.style.display);
}

/**
 * Fetches a random quote and displays it on the webpage.
 */
async function fetchRandomquote() {
    try {
        await fetchRandomURL();
        const response = await fetch("https://randomnessy.000webhostapp.com/");
        var text = await response.text();
        const container = document.getElementById("randomContentContainer");
        container.innerHTML += '<br><h1 style="text-align: center;">and some cookie...</h1>' + text;
    } catch (error) {
        console.error("Error fetching text:", error);
    }
}
/**
 * Fetches the user's location using geolocation API.
 */
function getLocation() {
    navigator.geolocation ? navigator.geolocation.getCurrentPosition(
        function(position) {
            var latitude = position.coords.latitude;
            var windyLink = "https://www.windy.com/" + latitude + "/" + position.coords.longitude;
            document.getElementById("windyLink").href = windyLink;
            var meteoblueLink = "https://www.meteoblue.com/en/weather/week/" + latitude.toFixed(3) + "N" + position.coords.longitude.toFixed(3) + "E";
            document.getElementById("meteoblueLink").href = meteoblueLink;
            var rucSoundingsLink = "https://rucsoundings.noaa.gov/gwt/?data_source=GFS&latest=latest&fcst_len=shortest&airport=" + latitude + "%2C" + position.coords.longitude + "&n_hrs=24&gwt=Interactive&start=latest";
            document.getElementById("rucSoundingsLink").href = rucSoundingsLink;
        },
        function(error) {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Please enable location services to use this feature.");
            } else {
                console.error("Error getting geolocation:", error);
            }
        }
    ) : alert("Geolocation is not supported by this browser.");
}
/**
 * Fetches a random URL and displays it on the webpage.
 */
async function fetchRandomURL() {
    return fetch("https://cyberorg.github.io/xcleague/")
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const links = Array.from(doc.querySelectorAll('a[href^="http"]:not([href^="tel:"])')).map(link => ({
                href: link.href,
                text: link.textContent.trim()
            }));
            const randomLink = links[Math.floor(Math.random() * links.length)];
            const container = document.getElementById("randomContentContainer");
            container.innerHTML = "";
            const anchor = document.createElement("a");
            anchor.href = randomLink.href;
            anchor.textContent = randomLink.text;
            anchor.target = "_blank";
            container.appendChild(anchor);
        })
        .catch(error => console.error("Error fetching page:", error));
}
/**
 * Loads multiple soundings data for display.
 */
async function loadMultiple() {
    try {
        fetch("soundings.json", {
                headers: {
                    "Cache-Control": "no-cache"
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data !== null) {
                    soundings = data;
                    var listcontainer = document.getElementById("listcontainer");
                    listcontainer.innerHTML = "";
                    for (var i = 0; i < soundings.length; i++) {
                        var button = document.createElement("button");
                        var timestamp = new Date(soundings[i].time * 1000);
                        timestamp.setUTCHours(timestamp.getUTCHours() + 5);
                        timestamp.setUTCMinutes(timestamp.getUTCMinutes() + 30);
                        button.innerText = timestamp.getDate() + " - " + timestamp.getHours() + ":" + timestamp.getMinutes();
                        button.onclick = function(index) {
                            return function() {
                                document.querySelectorAll(".btn-spc").forEach(function(btn) {
                                    btn.classList.remove("active");
                                });
                                this.classList.add("active");
                                skewt.plot(soundings[index].lines);
                            };
                        }(i);
                        button.className = "btn btn-default btn-sm btn-spc";
                        listcontainer.appendChild(button);
                    }
                    if (0 < soundings.length) {
                        document.querySelector(".btn-spc").classList.add("active");
                        skewt.plot(soundings[0].lines);
                    }
                }
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                alert("Error fetching data: " + error);
            });
    } catch (error) {
        soundings = [];
        console.log(error);
        alert(error);
    }
}

fetchWeatherData();
fetchAlerts("alert1.txt", "todayAlerts", "todaySection");
fetchAlerts("alert2.txt", "tomorrowAlerts", "tomorrowSection");
getLocation();
const compassCircle = document.querySelector(".compass-circle");
const myPoint = document.querySelector(".my-point");
const startBtn = document.querySelector(".start-btn");
const distanceDisplay = document.getElementById("distance");
const isIOS =
  navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
  navigator.userAgent.match(/AppleWebKit/);

function init() {
  startBtn.addEventListener("click", startCompass);
  navigator.geolocation.getCurrentPosition(locationHandler);

  if (!isIOS) {
    window.addEventListener("deviceorientationabsolute", handler, true);
  }
}

function startCompass() {
  if (isIOS) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handler, true);
        } else {
          alert("has to be allowed!");
        }
      })
      .catch(() => alert("not supported"));
  }
}

let currentRotation = 0;
let pointDegree;
let currentPosition;

function handler(e) {
  let rawCompass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
  let normalizedCompass = rawCompass % 360; // Normalize compass value to 0-360 range
  if (normalizedCompass < 0) {
    normalizedCompass += 360; // Ensure positive value
  }

  let rotationDifference = normalizedCompass - currentRotation;

  // Adjust rotation if passing through 0 or 360
  if (Math.abs(rotationDifference) > 180) {
    rotationDifference = rotationDifference > 0 ? rotationDifference - 360 : rotationDifference + 360;
  }

  currentRotation += rotationDifference;
  compassCircle.style.transform = `translate(-50%, -50%) rotate(${-currentRotation}deg)`;

  // ±15 degree
  if (
    (pointDegree < Math.abs(normalizedCompass) &&
      pointDegree + 15 > Math.abs(normalizedCompass)) ||
    pointDegree > Math.abs(normalizedCompass + 15) ||
    pointDegree < Math.abs(normalizedCompass)
  ) {
    myPoint.style.opacity = 0;
  } else if (pointDegree) {
    myPoint.style.opacity = 1;
  }

  if (currentPosition) {
    const distance = calculateDistance(
      currentPosition.coords.latitude,
      currentPosition.coords.longitude
    );
    distanceDisplay.textContent = distance;
  }
}

function locationHandler(position) {
  currentPosition = position;
  const { latitude, longitude } = position.coords;
  pointDegree = calcDegreeToPoint(latitude, longitude);

  if (pointDegree < 0) {
    pointDegree = pointDegree + 360;
  }
}

function calcDegreeToPoint(latitude, longitude) {
  // Bir LZ geolocation
  const point = {
    lat: 32.0420615,
    lng: 76.7080957
  };

  const phiK = (point.lat * Math.PI) / 180.0;
  const lambdaK = (point.lng * Math.PI) / 180.0;
  const phi = (latitude * Math.PI) / 180.0;
  const lambda = (longitude * Math.PI) / 180.0;
  const psi =
    (180.0 / Math.PI) *
    Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) -
        Math.sin(phi) * Math.cos(lambdaK - lambda)
    );
  return Math.round(psi);
}

function calculateDistance(latitude, longitude) {
  const R = 6371; // Radius of the Earth in km
  const lat1 = currentPosition.coords.latitude;
  const lon1 = currentPosition.coords.longitude;
  const lat2 = 32.0420615; // Bir LZ geolocation latitude
  const lon2 = 76.7080957; // Bir LZ geolocation longitude

  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // Distance in km
  if (d > 2) {
    const miles = d * 0.621371; // Convert km to miles
    return `Bir LZ is ${miles.toFixed(2)} miles (${d.toFixed(2)} km) at ${pointDegree} degrees`;
  } else {
    const meters = d * 1000; // Convert km to meters
    return `Bir LZ is ${meters.toFixed(2)} meters (${(d * 3280.84).toFixed(2)} feet) at ${pointDegree} degrees`;
  }
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

init();

var skewt = new SkewT("#skewt");
var soundings = [];
loadMultiple();

        // Function to convert UTC time to IST
        function convertToIST(utcDate) {
            const istOffset = 5.5 * 60 * 60 * 1000; // Indian Standard Time offset in milliseconds
            const istDate = new Date(utcDate.getTime() + istOffset);
            return istDate.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });
        }

         // Function to convert UTC time to IST
        function convertToIST(utcDate) {
            const istOffset = 5.5 * 60 * 60 * 1000; // Indian Standard Time offset in milliseconds
            const istDate = new Date(utcDate.getTime() + istOffset);
            return istDate.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });
        }

        // Fetch JSON data from the file
        fetch('metar.json')
            .then(response => response.json())
            .then(data => {
                const metars = data.data;

                // Construct HTML content
                let htmlContent = '';

                metars.forEach(metar => {
                    htmlContent += `
                        <b>${metar.station.name}</b> - ${metar.raw_text}
                        <table id="mtable">
                            <tr>
                                <th>Location</th>
                                <td>${metar.station.location}</td>
                            </tr>
                            <tr>
                                <th>Observation Time (IST)</th>
                                <td>${convertToIST(new Date(metar.observed))}</td>
                            </tr>
                            <tr>
                                <th>Temperature</th>
                                <td>${metar.temperature.celsius}°C (${metar.temperature.fahrenheit}°F)</td>
                            </tr>
                            <tr>
                                <th>Dewpoint</th>
                                <td>${metar.dewpoint.celsius}°C (${metar.dewpoint.fahrenheit}°F)</td>
                            </tr>
                            ${
                                metar.wind ? `
                                    <tr>
                                        <th>Wind</th>
                                        <td>${metar.wind.degrees}° at ${metar.wind.speed_kph} km/h</td>
                                    </tr>
                                ` : ''
                            }
                            <tr>
                                <th>Visibility</th>
                                <td>${metar.visibility.meters} meters (${metar.visibility.miles} miles)</td>
                            </tr>
                            <tr>
                                <th>Clouds</th>
                                <td>${metar.clouds.map(cloud => `${cloud.code} (${cloud.text}) at ${cloud.base_feet_agl} feet (${cloud.base_meters_agl} meters AGL)`).join(', ')}</td>
                            </tr>
                            <tr>
                                <th>Flight Category</th>
                                <td>${metar.flight_category}</td>
                            </tr>
                            <tr>
                                <th>Barometer</th>
                                <td>${metar.barometer.hg} inHg (${metar.barometer.hpa} hPa)</td>
                            </tr>
                            <tr>
                                <th>Humidity</th>
                                <td>${metar.humidity.percent}%</td>
                            </tr>
                        </table>
                      
                    `;
                });

                // Inject HTML content into the page
                document.getElementById('metarData').innerHTML = htmlContent;
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });

window.onload = function() {
//    detectSystemTheme();
    fetchRandomURL();
    fetchRandomquote();
};

/**
 * Event listener for the "Randomness" button.
 */
document.getElementById("randomness").addEventListener("click", async function() {
    event.preventDefault();
    await fetchRandomURL();
    await fetchRandomquote();
});

document.getElementById("addToHomeScreen").addEventListener("click", function() {
    window.scrollTo(0, 0);
    window.AddToHomeScreenInstance = new window.AddToHomeScreen({
        appName: "ParaguideWS",
        appIconUrl: "apple-touch-icon.png",
        assetUrl: "https://cdn.jsdelivr.net/gh/philfung/add-to-homescreen@1.8/dist/assets/img/",
        showErrorMessageForUnsupportedBrowsers: window.AddToHomeScreen.SHOW_ERRMSG_UNSUPPORTED.ALL,
        allowUserToCloseModal: false,
        maxModalDisplayCount: -1
    });
    ret = window.AddToHomeScreenInstance.show();
   
});