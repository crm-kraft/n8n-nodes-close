Based on the video, the user is proposing a new node called **"Create or update an opportunity"**. Here is a breakdown of the fields, logic, and behavior they are requesting:

**Inputs/Fields:**
*   **Pipeline Filter:** An input to specify which pipeline to look in.
*   **Status Type Filter:** An input to filter by the status of the opportunity (e.g., active, won, lost). 
    *   This field needs to support selecting **multiple** status types at the same time (e.g., selecting both "active" and "lost").
    *   The user mentions this should be an **optional** filter.

**Logic and Step-by-Step Behavior:**
1.  **Search:** When the node runs, it should first search to see if an opportunity already exists within the specified pipeline.
2.  **Update:** If an existing opportunity is found in that pipeline (and matches the optional status type filter, if used), the node should **update** that existing opportunity.
3.  **Create:** If no existing opportunity is found, the node should **create** a new opportunity.