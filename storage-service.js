const listings = require("./listings.json");

const HORIZONTAL_VEHICLES = true;

function findStorageLocations(vehicles) {
  const results = [];
  const locationMap = new Map();

  listings.forEach((listing) => {
    if (!locationMap.has(listing.location_id)) {
      locationMap.set(listing.location_id, []);
    }
    locationMap.get(listing.location_id).push(listing);
  });

  for (const [location_id, locationListings] of locationMap) {
    const combination = findCheapestCombination(locationListings, vehicles);
    if (combination) {
      results.push({
        location_id,
        listing_ids: combination.listings.map((listing) => listing.id),
        total_price_in_cents: combination.total_price_in_cents,
      });
    }
  }

  return results.sort(
    (a, b) => a.total_price_in_cents - b.total_price_in_cents
  );
}

function findCheapestCombination(locationListings, vehicles) {
  const numVehicles = vehicles.reduce(
    (sum, vehicle) => sum + vehicle.quantity,
    0
  );
  let possibleCombinations = [];

  for (
    let numListings = 1;
    numListings <= numVehicles && numListings <= locationListings.length;
    numListings++
  ) {
    const combinations = combinationN(locationListings, numListings);
    possibleCombinations.push(...combinations);
  }

  possibleCombinations = possibleCombinations.map((combination) => {
    return {
      listings: [...combination],
      total_price_in_cents: combination.reduce(
        (sum, listing) => sum + listing.price_in_cents,
        0
      ),
    };
  });

  possibleCombinations = possibleCombinations.sort(
    (a, b) => a.total_price_in_cents - b.total_price_in_cents
  );

  for (const combination of possibleCombinations) {
    if (canFitVehicles(combination.listings, vehicles)) {
      return combination;
    }
  }

  return null;
}

function combinationN(items, n) {
  const results = [];

  if (n === 1) {
    for (const item of items) {
      results.push([item]);
    }
    return results;
  }

  for (let i = 0; i <= items.length - n; i++) {
    const subCombinations = combinationN(items.slice(i + 1), n - 1);
    for (const c of subCombinations) {
      results.push([items[i], ...c]);
    }
  }

  return results;
}

function canFitVehicles(locationListings, vehicles) {
  let columns = locationListings
    .reduce((acc, listing) => {
      const numColumns = Math.floor(
        (HORIZONTAL_VEHICLES ? listing.length : listing.width) / 10
      );
      const columnLength = HORIZONTAL_VEHICLES ? listing.width : listing.length;

      acc.push(...Array(numColumns).fill(columnLength));
      return acc;
    }, [])
    .sort((a, b) => a - b);

  let separatedVehicles = vehicles
    .reduce((acc, vehicle) => {
      acc.push(...Array(vehicle.quantity).fill(vehicle.length));
      return acc;
    }, [])
    .sort((a, b) => b - a);

  for (const vehicle of separatedVehicles) {
    let foundSpot = false;
    for (let i = 0; i < columns.length; i++) {
      if (vehicle <= columns[i]) {
        columns[i] = columns[i] - vehicle;
        columns.sort((a, b) => a - b);
        foundSpot = true;
        break;
      }
    }

    if (!foundSpot) {
      return false;
    }
  }

  return true;
}

module.exports = {
  findStorageLocations,
};
