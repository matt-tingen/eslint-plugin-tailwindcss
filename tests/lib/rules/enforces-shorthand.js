/**
 * @fileoverview Detect classname candidates for shorthand replacement
 * @description E.g. `mx-4 my-4` can be replaced by `m-4`
 * @author François Massart
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/enforces-shorthand");
var RuleTester = require("eslint").RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var parserOptions = {
  ecmaVersion: 2019,
  sourceType: "module",
  ecmaFeatures: {
    jsx: true,
  },
};

var generateError = (classnames, shorthand) => {
  return {
    messageId: "shorthandCandidateDetected",
    data: {
      classnames: classnames.join(", "),
      shorthand: shorthand,
    },
  };
};

var ruleTester = new RuleTester({ parserOptions });

ruleTester.run("shorthands", rule, {
  valid: [
    {
      code: `
      <div class="overflow-x-auto overflow-y-scroll">
        No shorthand possible for overflow
      </div>
      `,
    },
    {
      code: `
      <div class="overscroll-x-auto overscroll-y-none">
        No shorthand possible for overscroll
      </div>
      `,
    },
    {
      code: `
      <div class="mt-0 mr-1 mb-3 ml-4">
        No shorthand possible for margin
      </div>
      `,
    },
    {
      code: `
      <div class="top-[0] right-[50%] bottom-[10px] left-[var(--some-value)]">
        No shorthand possible for inset
      </div>`,
    },
    {
      code: `
      <div class="top-[0] right-0 bottom-0 left-[0]">
        Cannot merge mixed values (arbitrary + regular)
      </div>`,
    },
    {
      code: `
      <div class="grid gap-x-8 gap-y-4 grid-cols-3">
        No shorthand possible for gap
      </div>`,
    },
    {
      code: `<img class="scale-x-75 -scale-y-75" />`,
    },
  ],

  invalid: [
    {
      code: `
      <div class="overflow-x-auto overflow-y-auto block md:p-0 px-0 py-[0]">
        Possible shorthand for overflow
      </div>
      `,
      output: `
      <div class="overflow-auto block md:p-0 px-0 py-[0]">
        Possible shorthand for overflow
      </div>
      `,
      errors: [generateError(["overflow-x-auto", "overflow-y-auto"], "overflow-auto")],
    },
    {
      code: `
      <div class="overscroll-x-contain overscroll-y-contain block md:p-0 px-0 py-[0]">
        Possible shorthand for overscroll
      </div>
      `,
      output: `
      <div class="overscroll-contain block md:p-0 px-0 py-[0]">
        Possible shorthand for overscroll
      </div>
      `,
      errors: [generateError(["overscroll-x-contain", "overscroll-y-contain"], "overscroll-contain")],
    },
    {
      code: `
      <div class="mt-0 mr-0 mb-0 ml-1">
        Possible shorthand for margin
      </div>
      `,
      output: `
      <div class="my-0 mr-0 ml-1">
        Possible shorthand for margin
      </div>
      `,
      errors: [generateError(["mt-0", "mb-0"], "my-0")],
    },
    {
      code: `
      <div class="-mt-1 -mr-1 -mb-1 ml-0">
        Possible shorthand for negative margin
      </div>
      `,
      output: `
      <div class="-my-1 -mr-1 ml-0">
        Possible shorthand for negative margin
      </div>
      `,
      errors: [generateError(["-mt-1", "-mb-1"], "-my-1")],
    },
    {
      code: `
      <div class="mt-0 mr-0 mb-0 ml-1 md:mx-2 md:my-2 py-0 px-0 block">
        Possible shorthand for margin
      </div>
      `,
      output: `
      <div class="my-0 mr-0 ml-1 md:m-2 p-0 block">
        Possible shorthand for margin
      </div>
      `,
      errors: [
        generateError(["mt-0", "mb-0"], "my-0"),
        generateError(["md:mx-2", "md:my-2"], "md:m-2"),
        generateError(["py-0", "px-0"], "p-0"),
      ],
    },
    {
      code: `
      <div class="rounded-tl-sm rounded-tr-sm rounded-br-lg rounded-bl-xl md:rounded-t-md md:rounded-b-md">
        Possible shorthand for border-radius
      </div>
      `,
      output: `
      <div class="rounded-t-sm rounded-br-lg rounded-bl-xl md:rounded-md">
        Possible shorthand for border-radius
      </div>
      `,
      errors: [
        generateError(["rounded-tl-sm", "rounded-tr-sm"], "rounded-t-sm"),
        generateError(["md:rounded-t-md", "md:rounded-b-md"], "md:rounded-md"),
      ],
    },
    {
      code: `
      <div class="rounded-tl rounded-tr rounded-b">
        Possible shorthand for border-radius
      </div>
      `,
      output: `
      <div class="rounded">
        Possible shorthand for border-radius
      </div>
      `,
      errors: [generateError(["rounded-tl", "rounded-tr", "rounded-b"], "rounded")],
    },
    {
      code: `
      <div class="rounded-tl-sm rounded-tr-sm rounded-b-sm">
        Possible shorthand for border-radius
      </div>
      `,
      output: `
      <div class="rounded-sm">
        Possible shorthand for border-radius
      </div>
      `,
      errors: [generateError(["rounded-tl-sm", "rounded-tr-sm", "rounded-b-sm"], "rounded-sm")],
    },
    {
      code: `
      <div class="rounded-tl-sm rounded-tr-sm rounded-br-lg rounded-bl-xl">
        Possible shorthand for border-radius
      </div>
      `,
      output: `
      <div class="rounded-t-sm rounded-br-lg rounded-bl-xl">
        Possible shorthand for border-radius
      </div>
      `,
      errors: [generateError(["rounded-tl-sm", "rounded-tr-sm"], "rounded-t-sm")],
    },
    {
      code: `
      <div class="rounded-tl-sm rounded-tr-sm rounded-br-lg rounded-bl-xl md:rounded-t-md md:rounded-b-md">
        Possible shorthand for border-radius
      </div>
      `,
      output: `
      <div class="rounded-t-sm rounded-br-lg rounded-bl-xl md:rounded-md">
        Possible shorthand for border-radius
      </div>
      `,
      errors: [
        generateError(["rounded-tl-sm", "rounded-tr-sm"], "rounded-t-sm"),
        generateError(["md:rounded-t-md", "md:rounded-b-md"], "md:rounded-md"),
      ],
    },
    {
      code: `
      <div class="border-t-4 border-r-4 border-b-4 border-l-0 md:border-t-0 md:border-b-0 md:border-r-0 lg:border-y lg:border-l lg:border-r">
        Possible shorthand for border-width
      </div>
      `,
      output: `
      <div class="border-y-4 border-r-4 border-l-0 md:border-y-0 md:border-r-0 lg:border">
        Possible shorthand for border-width
      </div>
      `,
      errors: [
        generateError(["border-t-4", "border-b-4"], "border-y-4"),
        generateError(["md:border-t-0", "md:border-b-0"], "md:border-y-0"),
        generateError(["lg:border-y", "lg:border-l", "lg:border-r"], "lg:border"),
      ],
    },
    {
      code: `
      <div class="border-t-4 border-r-4 border-b-4 border-l-0">
        Possible shorthand for border-width
      </div>
      `,
      output: `
      <div class="border-y-4 border-r-4 border-l-0">
        Possible shorthand for border-width
      </div>
      `,
      errors: [generateError(["border-t-4", "border-b-4"], "border-y-4")],
    },
    {
      code: `
      <div class="top-[0] right-[var(--some-value)] bottom-[0] left-[var(--some-value)]">
        No shorthand possible
      </div>`,
      output: `
      <div class="inset-y-[0] inset-x-[var(--some-value)]">
        No shorthand possible
      </div>`,
      errors: [
        generateError(["top-[0]", "bottom-[0]"], "inset-y-[0]"),
        generateError(["right-[var(--some-value)]", "left-[var(--some-value)]"], "inset-x-[var(--some-value)]"),
      ],
    },
    {
      code: `
      <div class="rounded-tr-sm border-r-4 block rounded-br-lg rounded-bl-xl md:rounded-b-md border-t-4 rounded-tl-sm border-b-4 border-l-0 md:rounded-t-md">
        Randomized classnames order
      </div>
      `,
      output: `
      <div class="rounded-t-sm rounded-br-lg rounded-bl-xl md:rounded-md border-y-4 border-y-4 border-l-0 block">
        Randomized classnames order
      </div>
      `,
      errors: [
        generateError(["rounded-tr-sm", "rounded-tl-sm"], "rounded-t-sm"),
        generateError(["md:rounded-b-md", "md:rounded-t-md"], "md:rounded-md"),
        generateError(["border-t-4", "border-b-4"], "border-y-4"),
      ],
    },
    {
      code: `
      <div class="grid gap-x-4 gap-y-4 grid-cols-3">
        Possible shorthand for gap
      </div>`,
      output: `
      <div class="grid gap-4 grid-cols-3">
        Possible shorthand for gap
      </div>`,
      errors: [generateError(["gap-x-4", "gap-y-4"], "gap-4")],
    },
    {
      code: `
      <div class="border-4 border-t-indigo-200/50 border-x-indigo-200/50 border-b-indigo-200/50">
        Possible shorthand for border-color
      </div>`,
      output: `
      <div class="border-4 border-indigo-200/50">
        Possible shorthand for border-color
      </div>`,
      errors: [
        generateError(
          ["border-t-indigo-200/50", "border-x-indigo-200/50", "border-b-indigo-200/50"],
          "border-indigo-200/50"
        ),
      ],
    },
    {
      code: `<img class="scale-x-75 scale-y-75" />`,
      output: `<img class="scale-75" />`,
      errors: [generateError(["scale-x-75", "scale-y-75"], "scale-75")],
    },
    {
      code: `<img class="-scale-x-50 -scale-y-50" />`,
      output: `<img class="-scale-50" />`,
      errors: [generateError(["-scale-x-50", "-scale-y-50"], "-scale-50")],
    },
  ],
});