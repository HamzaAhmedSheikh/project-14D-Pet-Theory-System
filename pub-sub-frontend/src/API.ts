/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type ReportInput = {
  firstName: string,
  lastName: string,
  reportTitle: string,
  desc: string,
};

export type Event = {
  __typename: "Event",
  result?: string,
};

export type Report = {
  __typename: "Report",
  id?: string,
  firstName?: string,
  lastName?: string,
  reportTitle?: string,
  desc?: string,
};

export type AddReportMutationVariables = {
  report?: ReportInput,
};

export type AddReportMutation = {
  addReport?:  {
    __typename: "Event",
    result: string,
  } | null,
};

export type DeleteReportMutationVariables = {
  reportId?: string,
};

export type DeleteReportMutation = {
  deleteReport?:  {
    __typename: "Event",
    result: string,
  } | null,
};

export type GetReportsQuery = {
  getReports?:  Array< {
    __typename: "Report",
    id: string,
    firstName: string,
    lastName: string,
    reportTitle: string,
    desc: string,
  } > | null,
};
