<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $envUsername = env('STORAGE_USERNAME');
        $envHash = env('STORAGE_PASSWORD_HASH');

        if ($request->username === $envUsername && Hash::check($request->password, $envHash)) {
            $user = \App\Models\User::first();
            $token = \Tymon\JWTAuth\Facades\JWTAuth::customClaims(['user' => $envUsername])->fromUser($user);

            return response()->json([
                'token' => $token,
                'expires_at' => now()->addMinutes((int) config('jwt.ttl', 10080))->toIso8601String(),
            ]);
        }

        return response()->json(['error' => 'Unauthorized'], 401);
    }

    /**
     * Get the authenticated User's info.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function me()
    {
        return response()->json([
            'username' => env('STORAGE_USERNAME'),
            // Mocking storage stats for now, to be implemented
            'storage_used' => 0,
            'storage_total' => env('STORAGE_QUOTA_GB', 100) * 1024 * 1024 * 1024,
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        try {
            \Tymon\JWTAuth\Facades\JWTAuth::invalidate(\Tymon\JWTAuth\Facades\JWTAuth::getToken());
            return response()->json(['message' => 'Successfully logged out']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to logout'], 500);
        }
    }
}
