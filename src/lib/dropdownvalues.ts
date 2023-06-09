export const jobCategoryOptions = [
  { value: "unemployed", label: "" },
  { value: "informationTechnology", label: "Information Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "education", label: "Education" },

  // Add more job category options here
];

export const maritalStatusOptions = [
  { value: "none", label: "" },
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "divorced", label: "Divorced" },
  { value: "widowed", label: "Widowed" },
];

export const provinceOptions = [
  { value: "none", label: "" },
  {
    value: "province 1",
    label: "",
    municipality: {
      value: "",
      label: "",
    },
  },
  {
    value: "province 2",
    label: "",
    municipality: {
      value: "",
      label: "",
    },
  },
  {
    value: "province 3",
    label: "",
    municipality: [
      {
        value: "",
        label: "",
        barangay: [
          {
            value: "",
            label: "",
            zip: "",
          },
        ],
      },
    ],
  },
  {
    value: "province 4",
    label: "",
    municipality: {
      value: "",
      label: "",
    },
  },
];
