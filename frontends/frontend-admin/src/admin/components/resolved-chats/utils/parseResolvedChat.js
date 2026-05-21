export const parseResolvedChat =
  (content) => {

    if (
      typeof content ===
      "object" &&
      content !== null
    ) {

      return content
    }

    if (
      typeof content !==
      "string"
    ) {

      return {
        "Issue Reported":
          "",

        "Issue Found":
          "",

        "Root Cause":
          "",

        "Work Done":
          "",
      }
    }

    try {

      return JSON.parse(
        content
      )

    } catch {

      return {
        "Issue Reported":
          content,

        "Issue Found":
          "",

        "Root Cause":
          "",

        "Work Done":
          "",
      }
    }
  }