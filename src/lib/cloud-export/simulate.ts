function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runStages(stages: string[], onStage: (stage: string, index: number, total: number) => void, msPerStage = 550): Promise<void> {
  for (let i = 0; i < stages.length; i++) {
    onStage(stages[i], i, stages.length);
    await wait(msPerStage);
  }
}

export function destinationStages(destinationId: string, target?: string): string[] {
  switch (destinationId) {
    case "download":
      return ["Preparing file"];
    case "email":
      return ["Preparing report", target ? `Sending to ${target}` : "Sending email"];
    case "google-sheets":
      return ["Preparing data", "Creating spreadsheet", "Syncing rows to Google Sheets"];
    case "dropbox":
      return ["Preparing file", "Uploading to Dropbox"];
    case "onedrive":
      return ["Preparing file", "Uploading to OneDrive"];
    default:
      return ["Processing"];
  }
}

export function connectionStages(destinationName: string): string[] {
  return [`Opening ${destinationName} sign-in`, "Waiting for authorization", "Finalizing connection"];
}
