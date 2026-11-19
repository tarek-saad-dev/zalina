import { NextResponse } from "next/server";
/** Retired: static About photos are now managed by the native Zalina Mini CMS. */
export function GET(){return NextResponse.json({message:"Use /admin/content"},{status:410});}
export function PUT(){return NextResponse.json({message:"Use /admin/content"},{status:410});}
export function DELETE(){return NextResponse.json({message:"Use /admin/content"},{status:410});}
