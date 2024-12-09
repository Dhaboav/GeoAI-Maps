<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function processInput(Request $request) {
        // Validate input
        $request->validate([
            'input' => 'nullable|string',
        ]);
    
        // Get input
        $input = $request->input('input');
    
        // Check if the input is empty
        if (empty($input)) {
            return response()->json([
                'error' => 'Input cannot be empty.',
            ], 400);
        }
    
        // Split input into parts
        $parts = explode(' ', $input);
    
        // Assign parts to variables
        $barcode_id = $parts[0] ?? null;
        $jarak = $parts[1] ?? null;
    
        // Validate jarak if it exists
        if ($jarak !== null && !is_numeric($jarak)) {
            return response()->json([
                'error' => 'Jarak must be a valid number.',
            ], 400);
        }
    
        // Return JSON response
        return response()->json([
            'barcode_id' => $barcode_id,
            'jarak' => $jarak,
        ]);
    }
}
