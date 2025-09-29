export interface Icon {
  name: string,
  type?: "outlined" | "round" | "sharp" | "two-tone" | null
  data: string,
  preserveColor?: boolean,
}

// keep one as an example, remove when no longer needed.
export const book: Icon = {
  name: 'book',
  data: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 22.106 30"><path id="book" d="M26.9,9.405V25.749c0,.824-.713,1.218-1.579,1.832a1.034,1.034,0,0,1-1.579-.927V10.685a.877.877,0,0,0-.5-.845c-.379-.194-12.218-6.418-12.218-6.418A2.239,2.239,0,0,0,8.9,3.4,4.487,4.487,0,0,0,7.119,4.808l12.916,7.077a.917.917,0,0,1,.555.815V29.755a1.057,1.057,0,0,1-.582.924,1.209,1.209,0,0,1-1.136-.042c-.339-.207-12.274-7.526-13.063-8-.379-.227-.823-.693-.832-1.039L4.8,5.355a2.612,2.612,0,0,1,.456-1.629c1.1-1.711,4.94-3.658,6.884-2.65L26.348,8.268A1.151,1.151,0,0,1,26.9,9.405Z" transform="translate(-4.799 -0.8)"/></svg>'
};
