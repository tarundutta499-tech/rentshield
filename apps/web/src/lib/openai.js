export async function generateLandlordLetter({ category, summary, details }) {
  try {
    const response = await fetch(
      "https://generatedisputecontent-dpjff3lvhq-uc.a.run.app",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disputeType: category,
          description: details,
          context: summary,
        }),
      }
    );

    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Server returned invalid response: " + text);
    }

    if (!data.success) {
      throw new Error(data.error || "Failed to generate letter");
    }

    return data.data || data.raw;

  } catch (error) {
    console.error("Frontend error:", error);
    throw error;
  }
}
