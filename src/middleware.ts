import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(req: NextRequest) {
    console.log(`${req.method} - ${req.url}`);

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
// export const config = {
//     matcher: '/about/:path*',
// }