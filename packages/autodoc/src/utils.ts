/**
 * Updates sections of a file delimited by sentinel tags with new content from the docs object.
 * The docs object should have keys corresponding to section headings and thus sentinel tags in
 * the file. If any sentinel tags are missing in the original file, an error will immediately be 
 * thrown.
 * 
 * @param fileContent the content of the file to be updated
 * @param docs the documentation content to update the file with
 * @returns the updated file content
 */
export function updateDocSections(fileContent: string, docs: Record<string, string>): string {
  const headings = Object.keys(docs);

  let anyFound = false;
  const statuses: Record<string, { startFound: boolean; endFound: boolean }> = {};

  for (const heading of headings) {
    const startFound = fileContent.includes(`<!-- jspsych-autodocs:${heading}:start -->`);
    const endFound = fileContent.includes(`<!-- jspsych-autodocs:${heading}:end -->`);
    statuses[heading] = { startFound, endFound };
    if (startFound || endFound) anyFound = true;
  }

  if (!anyFound) {
    throw new Error(
      "No sentinel tags found, is this a valid jsPsych autodoc target? If not, create a new file with the CLI to observe the structure."
    );
  }

  const errors: string[] = [];
  for (const heading of headings) {
    const { startFound, endFound } = statuses[heading];
    const startTag = `<!-- jspsych-autodocs:${heading}:start -->`;
    const endTag = `<!-- jspsych-autodocs:${heading}:end -->`;

    if (!startFound && !endFound) {
      errors.push(
        `${heading} sentinel start and end tag was not found.\n` +
        `Insert ${startTag} before the heading to complete the tag\n` +
        `Insert ${endTag} after the chart to complete the tag`
      );
    } else if (!startFound) {
      errors.push(
        `${heading} sentinel start tag was not found.\n` +
        `Insert ${startTag} before the heading to complete the tag`
      );
    } else if (!endFound) {
      errors.push(
        `${heading} sentinel end tag was not found.\n` +
        `Insert ${endTag} after the chart to complete the tag`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n\n"));
  }

  let result = fileContent;
  for (const heading of headings) {
    const startTag = `<!-- jspsych-autodocs:${heading}:start -->`;
    const endTag = `<!-- jspsych-autodocs:${heading}:end -->`;
    const start = result.indexOf(startTag);
    const end = result.indexOf(endTag) + endTag.length;
    result = result.slice(0, start) + docs[heading] + result.slice(end);
  }

  return result;
}
