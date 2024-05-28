document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await get_pools();
    const pools = data["body"]["pools"];
    const pools_data = data["body"]["data"][0];
    console.log(`pools: ${pools}`);
    const latestPoolData = getLatestPoolData(pools, pools_data);
    createPoolCards(pools);
  } catch (error) {
    console.error("Error updating pool cards:", error);
  }
});

// document.addEventListener("DOMContentLoaded", () => {
//   const latestPoolData = getLatestPoolData(pools, pools_data);
//   createPoolCards(latestPoolData);
// });

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

  //   const raw = JSON.stringify({
  //     operation: "add_data",
  //     id: "1",
  //     time: "",
  //     free_chlorine: "1.5",
  //     combined_chlorine: "0.5",
  //     water_clarity: 5,
  //     temp: 25,
  //     tester_name: "Dan",
  //   });

  // Construct the request options
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  // Use try-catch to handle errors
  try {
    const response = fetch(
      "https://sdvonb1u21.execute-api.eu-west-2.amazonaws.com/dev",
      requestOptions
    );

    console.log(`response: ${response}`);
    return response;
  } catch (error) {
    // Handle errors
    logging("error", error);
    throw error; // Propagate the error if needed
  }
}

async function get_pools(site = "Solihull") {
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

    const pools = JSON.stringify(data["body"]["pools"]);
    const pools_data = JSON.stringify(data["body"]["data"][0]);

    console.log(`get_site_data response: ${pools}`);
    console.log(`get_site_data response: ${pools_data}`);

    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

// Function to get the latest data for each pool
function getLatestPoolData(pools, poolsData) {
  console.log(`getLatestPoolData ${poolsData}`);
  const latestData = {};

  poolsData.forEach((data) => {
    const poolId = data.id;
    const dataTime = new Date(data.time).getTime();

    if (
      !latestData[poolId] ||
      dataTime > new Date(latestData[poolId].time).getTime()
    ) {
      latestData[poolId] = data;
    }
  });

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

// Function to create and append pool cards
function createPoolCards(pool_list) {
  const container = document.getElementById("pool-container");

  for (let i = 0; i < pool_list.length; i++) {
    pool = pool_list[i];
    // Create card elements
    const colDiv = document.createElement("div");
    colDiv.className = "col-lg-3";

    const cardDiv = document.createElement("div");
    cardDiv.className = "card pool-card mb-4";

    const cardBodyDiv = document.createElement("div");
    cardBodyDiv.className = "card-body";

    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title pool-name";
    cardTitle.innerText = `${pool.name}`;

    const freeChlorineP = document.createElement("p");
    freeChlorineP.innerHTML = `Free Chlorine: ${pool.free_chlorine} ppm <span class="text-success"><i class="fas fa-check"></i></span>`;

    const combinedChlorineP = document.createElement("p");
    combinedChlorineP.innerHTML = `Combined Chlorine: ${pool.combined_chlorine} ppm <span class="text-success"><i class="fas fa-check"></i></span>`;

    const tempP = document.createElement("p");
    tempP.innerHTML = `Temperature: ${pool.temp}°C <span class="text-success"><i class="fas fa-check"></i></span>`;

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
