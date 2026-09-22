import type { INodeProperties } from "n8n-workflow";

const show = {
  resource: ["lead", "contact", "opportunity"],
  operation: ["upsertByFields"],
};
export const upsertProperties: INodeProperties[] = [
  {
    displayName: "When Multiple Matches Are Found",
    name: "upsertMultipleMatches",
    type: "options",
    default: "error",
    displayOptions: { show },
    options: [
      { name: "Return All Matches Without Updating", value: "returnAll" },
      { name: "Stop With Error", value: "error" },
      { name: "Update First Match", value: "first" },
    ],
    description:
      "Choose whether to stop, update the first exact match in Close search response order, or return every match as a separate item without writing. Search response order can change.",
  },

  {
    displayName: "Match Keys (In Order)",
    name: "upsertMatchKeys",
    type: "fixedCollection",
    default: {},
    typeOptions: { multipleValues: true },
    placeholder: "Add Match Key",
    displayOptions: { show },
    description:
      "Try keys from top to bottom. Skip empty values; try the next key when no exact match exists. Multiple matches follow the selected handling option.",
    options: [
      {
        displayName: "Keys",
        name: "keys",
        values: [
          {
            displayName: "Field Name or ID",
            name: "field",
            type: "options",
            default: "",
            required: true,
            typeOptions: {
              loadOptionsMethod: "getUpsertMatchFields",
              loadOptionsDependsOn: ["resource"],
            },
            description:
              'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
          },
          {
            displayName: "Value",
            name: "value",
            type: "string",
            default: "",
            description:
              "Exact value to match. Empty values skip this key. Expressions may provide typed values.",
          },
        ],
      },
    ],
  },
  {
    displayName: "Lead ID",
    name: "upsertLeadId",
    type: "string",
    default: "",
    required: true,
    displayOptions: {
      show: {
        resource: ["contact", "opportunity"],
        operation: ["upsertByFields"],
      },
    },
    description:
      "Only match records belonging to this lead; use this lead when creating",
  },
  {
    displayName: "Pipeline Name or ID",
    name: "upsertPipelineId",
    type: "options",
    default: "",
    required: true,
    displayOptions: {
      show: { resource: ["opportunity"], operation: ["upsertByFields"] },
    },
    typeOptions: { loadOptionsMethod: "getPipelinesForUpsert" },
    description:
      'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
  },
  {
    displayName: "Fields to Write",
    name: "upsertValues",
    type: "resourceMapper",
    noDataExpression: true,
    default: { mappingMode: "defineBelow", value: {} },
    displayOptions: { show },
    typeOptions: {
      loadOptionsDependsOn: ["resource"],
      resourceMapper: {
        resourceMapperMethod: "getUpsertWriteFields",
        mode: "add",
        fieldWords: { singular: "Field", plural: "Fields" },
        addAllFields: false,
        supportAutoMap: false,
      },
    },
  },
  {
    displayName: "On Match",
    name: "upsertUpdateMode",
    type: "options",
    default: "replace",
    displayOptions: { show },
    options: [
      { name: "Replace Supplied Fields", value: "replace" },
      { name: "Fill Empty Fields Only", value: "fillEmpty" },
    ],
    description:
      "Match keys are copied on create, but only Fields to Write are changed on existing records",
  },
  {
    displayName: "Preview Only",
    name: "upsertPreview",
    type: "boolean",
    default: true,
    displayOptions: { show },
    description:
      "Whether to return the proposed change without writing to Close",
  },
];
