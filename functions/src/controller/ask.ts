import { Request, Response } from "express";
import { BardAPI } from "bard-api-node";

export const ask = async (request: Request, response: Response) => {
  const { query } = request.body;
  try {
    const assistant = new BardAPI();

    // Set session information for authentication
    await assistant.setSession(
      "__Secure-1PSID",
      "dwglQWYsEinZRu7namyRu5wooWrsNEtzQN_H9LT2pg81wON5yLFy-QlEr0PHJz78a-16jQ."
    );
    const bardResponse = await assistant.getBardResponse(query);
    response.send(bardResponse.content);
  } catch (error) {
    console.error("Error:", error);
  }
};
