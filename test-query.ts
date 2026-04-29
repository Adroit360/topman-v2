import { getOrdersDashboardData } from "./src/features/orders/services/getOrdersDashboardData";

async function main() {
  try {
    const data = await getOrdersDashboardData();
    console.log("SUCCESS");
    console.log(JSON.stringify(data.stats, null, 2));
  } catch (error) {
    console.error("FAILURE");
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error).finally(() => process.exit());
