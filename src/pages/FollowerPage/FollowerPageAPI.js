import { BASE_URL } from "../../common/BASE_URL";

async function getFollowers(TOKEN, accountname) {
  try {
    const data = await fetch(
      BASE_URL + `/profile/${accountname}/follower?limit=Infinity`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-type": "application/json",
        },
      }
    );
    const result = await data.json();
    return result;
  } catch (error) {
    console.log(error.message);
  }
}

export { getFollowers };
