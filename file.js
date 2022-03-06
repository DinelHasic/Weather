let enter = document.getElementById("enter");
let pages = document.getElementById("pages").children;
let search = document.getElementById("search");
let links = document.getElementsByClassName("nav-link");
let table = document.createElement("table");
let showForecast = document.getElementById("showForecast");
let city;
// Weather Server Connection
function wheatearServer(city) {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&&APPID=7fafdc57595b548b898107e7e1791b19`,

    success(response) {
      getEachWhether(response);
      Forecast(response);
    },
    error: function () {
      alert("City not found");
    },
  });
}

// --- GET LOCATION ----
function getLocation() {
  navigator.geolocation.getCurrentPosition(showPosition);
}

// Call Server
function showPosition(position) {
  $.ajax({
    url: `https://api.openweathermap.org/data/2.5/onecall?lat=${position.coords.latitude}&lon=${position.coords.longitude}&exclude=hourly,daily&appid=7fafdc57595b548b898107e7e1791b19`,
    success(response) {
      let cityLocation = response.timezone.substring(7,response.timezone.length);

      wheatearServer(cityLocation);
    },
  });
}

// Get each  data
function getEachWhether(Wheatear) {
  Heading();
  for (let wet of Wheatear["list"]) {
    createTable(wet);
  }
  pages[1].append(table);
}

// Page Manipulation
function showPage(Item) {
  for (page of pages) {
    page.style.display = "none";
  }

  Item.style.display = "block";
}

function addActive(item) {
  for (link of links) {
    link.classList.remove("active");
  }

  item.classList.add("active");
}

function registerNavListeners() {
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function () {
      addActive(links[i]);
      showPage(pages[i]);
    });
  }
}

// Heading Table
function Heading() {
  table.innerHTML = "";

  table.className = "table";

  table.innerHTML += `
  <thead class="headerColor">
    <tr">
      <th scope="col">Wheatear</th>
      <th scope="col">Description</th>
      <th scope="col">Date and Time</th>
      <th scope="col">Temperature</th>
      <th scope="col">Humidity</th>
      <th scope="col">Wind Speed</th>
    </tr>
  </thead>
  `;
}

// Creating Table Hourly
function createTable(Wheatear) {
  table.innerHTML += `
           <tr>
           <td><img src="http://openweathermap.org/img/w/${Wheatear["weather"][0]["icon"]}.png"></td>
           <td>${Wheatear["weather"][0]["description"]}</td>
           <td>${Wheatear["dt_txt"]}</td>
           <td>${Wheatear["main"]["temp"]}C</td>
           <td>${Wheatear["main"]["humidity"]}%</td>
           <td>${Wheatear["wind"]["speed"]}km/h</td>
         </tr>
         `;
}

// Creating Elements
function createHeader(text) {
  let header = document.createElement("h4");

  header.innerHTML = text;

  return header;
}

function createDivElement(content, isCityResult = false) {
  let div = document.createElement("div");

  isCityResult
    ? div.classList.add("city-forecast-result")
    : div.classList.add("forecast-result");
  div.innerHTML = content;
  return div;
}

// ---- FORECAST ----
function Forecast(Wheatear) {
  showForecast.innerHTML = "";
  let data = new GetDataForecast(Wheatear);
  showForecast.append(
    createDivElement(
      `
      <h3>City Name: ${Wheatear["city"]["name"]}</h3>
      <span>Current temperature:${Wheatear["list"][0]["main"]["temp"]}
      It will ${Wheatear["list"][0]["weather"][0]["description"]}</span>
      <span><img src="http://openweathermap.org/img/w/${Wheatear["list"][0]["weather"][0]["icon"]}.png"></span>
      `,
      true
    )
  );
  showForecast.appendChild(
    createDivElement(`
    <p>Max humidity:${data.maxHum()}</p>
    <p>Low humidity:${data.minHum()}</p>`)
  );

  showForecast.appendChild(
    createDivElement(`
    <p>Avg temp:${data.averageTemp()}</p>
    <p>Avg humidity:${data.averageHum()}</p>`)
  );

  showForecast.appendChild(
    createDivElement(`
    <p>Low temp:${data.lowestTemperature()}</p>
    <p>Max temp:${data.highestTemperature()}</p>`)
  );
}

//  -- - GETTING DATA FOR FORECAST ---
function GetDataForecast(Weather) {
  let highestTemp = Weather["list"][0]["main"]["temp_max"];
  let lowestTemp = Weather["list"][0]["main"]["temp_min"];
  let maxHumidity = Weather["list"][0]["main"]["humidity"];
  let minHumidity = Weather["list"][0]["main"]["humidity"];
  let dateMax;
  let dateMin;

  this.highestTemperature = function () {
    for (let w of Weather["list"]) {
      if (highestTemp <= w.main.temp) {
        highestTemp = w.main.temp;
        dateMax = w.dt_txt;
      }
    }

    return ` ${highestTemp}°C Date/<strong>${dateMax}</strong>`;
  };

  this.lowestTemperature = function () {
    for (let w of Weather["list"]) {
      if (lowestTemp >= w.main.temp) lowestTemp = w.main.temp;
      dateMin = w.dt_txt;
    }

    return ` ${lowestTemp}°C Date/<strong>${dateMin}</strong>`;
  };

  this.maxHum = function () {
    for (let w of Weather["list"]) {
      if (maxHumidity <= w.main.humidity) maxHumidity = w.main.humidity;
    }

    return maxHumidity;
  };

  this.minHum = function () {
    for (let w of Weather["list"]) {
      if (minHumidity >= w.main.humidity) minHumidity = w.main.humidity;
    }

    return minHumidity;
  };

  this.averageHum = function () {
    let sum = 0;
    let count = 0;
    for (let w of Weather["list"]) {
      sum += w.main.humidity;

      count++;
    }

    return (sum / count).toFixed(2);
  };

  this.averageTemp = function () {
    let sum = 0;
    let count = 0;
    for (let w of Weather["list"]) {
      sum += w.main.temp;

      count++;
    }

    return (sum / count).toFixed(2);
  };
}

enter.addEventListener("click", function () {
  city = search.value;
  wheatearServer(city);
});


showPage(pages[0]);
registerNavListeners();
getLocation();
