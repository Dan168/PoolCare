// Configurables
let current_site = "Solihull";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await updatePoolStatus();
    setInterval(updatePoolStatus, 5 * 60 * 1000); // Update Interval
  } catch (error) {
    console.error("Error updating pool cards:", error);
  }
});

// Function to update pool status
async function updatePoolStatus() {
  console.log("Updated Pool Status", new Date());
  try {
    const data = await get_pools(current_site);
    const pools = data["body"]["pools"];
    const pools_data = data["body"]["data"];
    const latestPoolData = getLatestPoolData(pools, pools_data);
    createPoolCards(latestPoolData);
  } catch (error) {
    console.error("Error updating pool cards:", error);
  }
}

// Get the form and add the event listener
const addTestForm = document.getElementById("addTestForm");

addTestForm.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  // Get form data
  const formData = new FormData(addTestForm);

  const poolId = formData.get("poolSelect");
  const freeChlorine = parseFloat(formData.get("chlorineLevel"));
  const combinedChlorine = parseFloat(formData.get("combinedChlorine"));
  const temperature = parseFloat(formData.get("temperature")); // Use this if needed
  const waterClarity = parseInt(formData.get("clarity"));
  const testerName = formData.get("name");

  // Log data to console (for testing)
  console.log("Form data:", {
    poolId,
    freeChlorine,
    combinedChlorine,
    temperature, // This is optional
    waterClarity,
    testerName,
  });

  // Call your function and handle the response
  try {
    const response = await add_pool_data_entry(
      poolId,
      freeChlorine,
      combinedChlorine,
      waterClarity,
      temperature,
      testerName
    );

    if (response.ok) {
      // Show success message or close the modal
      console.log("Data logged successfully!");
      $("#addTestModal").modal("hide"); // Close the modal
      updatePoolStatus(); // Update the pool status without reloading
      updateTime();
    } else {
      console.error("Error logging data:", response.status);
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

// Log View to DB
async function add_pool_data_entry(
  poolId,
  free_chlorine,
  combined_chlorine,
  water_clarity,
  temperature,
  tester_name
) {
  // Create headers
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  // Construct the request body
  const raw = JSON.stringify({
    operation: "add_data",
    id: `${poolId}`,
    time: `${new Date().toISOString()}`,
    free_chlorine: `${free_chlorine}`,
    combined_chlorine: `${combined_chlorine}`,
    water_clarity: `${water_clarity}`,
    temp: `${temperature}`,
    tester_name: `${tester_name}`,
  });

  // Construct the request options
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  // Use try-catch to handle errors
  try {
    const response = await fetch(
      "https://sdvonb1u21.execute-api.eu-west-2.amazonaws.com/dev",
      requestOptions
    );

    console.log(`response: ${response}`);
    return response;
  } catch (error) {
    // Handle errors
    console.error("Error adding pool data:", error);
    throw error; // Propagate the error if needed
  }
}

async function get_pools(site) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    operation: "get_site_data",
    id: site,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      "https://sdvonb1u21.execute-api.eu-west-2.amazonaws.com/dev",
      requestOptions
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

// Function to get the latest data for each pool
function getLatestPoolData(pools, poolsData) {
  const latestData = {};

  for (let i = 0; i < poolsData.length; i++) {
    const data = poolsData[i];
    const poolId = data.id;
    const dataTime = new Date(data.time).getTime();

    if (
      !latestData[poolId] ||
      dataTime > new Date(latestData[poolId].time).getTime()
    ) {
      latestData[poolId] = data;
    }
  }

  return pools.map((pool) => ({
    ...pool,
    ...latestData[pool.id],
  }));
}

// Load form on click
$(document).on("click", ".add-test-btn", function () {
  // Event delegation
  var poolName = $(this).data("pool");
  $("#poolSelect").val(poolName);
  console.log(poolName);
  const poolSelect = document.getElementById("poolSelect");
  poolSelect.value = poolName;

  $("#addTestModal").modal("show");
});

// Function to check the time difference
function checkTimeDifference(timestamp, expiry_time = 2) {
  const now = new Date();
  const pastDate = new Date(timestamp);
  const diffInMs = now - pastDate;
  const diffInHours = diffInMs / (1000 * 60 * 60); // Convert milliseconds to hours

  if (diffInHours > expiry_time) {
    console.log("The log occurred more than 2 hours ago.");
    new Notification("Pool Care App", {
      body: `Test Due`,
      icon: "img/branding/pool_care_app_logo.png",
      tag: "Test Notification",
    });
    return ["bg-danger text-light", "Test Due"];
  } else if (diffInHours > 1.5) {
    console.log("The log occurred 1.5 hours ago.");
    new Notification("Pool Care App", {
      body: `Test Soon Due`,
      icon: "img/branding/pool_care_app_logo.png",
      tag: "Test Notification",
    });
    return ["bg-warning", "Test Soon"];
  } else {
    console.log("The log occurred within the last 1.5 hours.");
    return ["bg-success text-light", `✔`];
  }
}

// Function to check the time difference
function checkReadingLevel(reading, accepted_value = 1.5) {
  if (reading > accepted_value) {
    return "fas fa-times-circle";
  } else if (reading <= accepted_value) {
    return "fas fa-check-circle";
  }
}

// Function to create and append pool cards
function createPoolCards(pool_list) {
  const container = document.getElementById("pool-container");
  container.innerHTML = ""; // Clear existing cards

  if ((pool_list.length = 5)) {
    size_array = [
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6",
      "col-xs-12 col-md-6",
    ];
  } else if ((pool_list.length = 4)) {
    size_array = [
      "col-xs-12 col-md-6",
      "col-xs-12 col-md-6",
      "col-xs-12 col-md-6",
      "col-xs-12 col-md-6",
    ];
  } else {
    size_array = [
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
      "col-xs-12 col-md-6 col-lg-4",
    ];
  }

  for (let i = 0; i < pool_list.length; i++) {
    pool = pool_list[i];
    // Create card elements
    const colDiv = document.createElement("div");
    colDiv.className = `col-lg-${size_array[i]}`;

    let pool_status = checkTimeDifference(pool.time, 2);
    let pool_status_icon = "";
    if (pool_status[0].includes("success")) {
      let pool_status_icon = "fas fa-times-circle";
    }

    const cardDiv = document.createElement("div");
    cardDiv.className = `card ${pool_status[0]} shadow-lg pool-card mb-4`;

    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body";

    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title pool-name";
    cardTitle.innerHTML = `${pool.name} <span class="position-absolute badge-css translate-middle badge rounded-pill ${pool_status[0]}">
    ${pool_status[1]}
  </span>`;

    const freeChlorineP = document.createElement("div");
    freeChlorineP.innerHTML = `Free Chlorine: ${
      pool.free_chlorine
    } ppm <span><i class="${checkReadingLevel(
      pool.free_chlorine
    )}"></i></span>`;

    const combinedChlorineP = document.createElement("div");
    combinedChlorineP.innerHTML = `Combined Chlorine: ${
      pool.combined_chlorine
    } ppm <span><i class="${checkReadingLevel(
      pool.combined_chlorine
    )}"></i></span>`;

    const tempP = document.createElement("p");
    tempP.innerHTML = `Temperature: ${
      pool.temp
    }°C <span><i class="${checkReadingLevel(pool.temp)}"></i></span>`;

    const addButton = document.createElement("button");
    addButton.className = "btn btn-primary add-test-btn";
    addButton.dataset.pool = `${pool.id}`;
    addButton.innerText = "Add Test";

    // Append elements
    cardBodyDiv.appendChild(cardTitle);
    cardBodyDiv.appendChild(freeChlorineP);
    cardBodyDiv.appendChild(combinedChlorineP);
    cardBodyDiv.appendChild(tempP);
    cardBodyDiv.appendChild(addButton);

    cardDiv.appendChild(cardBodyDiv);
    colDiv.appendChild(cardDiv);
    container.appendChild(colDiv);
  }
}
