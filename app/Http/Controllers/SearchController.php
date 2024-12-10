<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    public function processInput(Request $request) {
        $request->validate([
            'input' => 'nullable|string',
        ]);

        $input = $request->input('input');

        if (empty($input)) {
            return response()->json(['error' => 'Input cannot be empty.'], 400);
        }

        // Split input into parts
        $parts = explode(' ', $input);
        $barcode_id = $parts[0] ?? null;
        $jarak = $parts[1] ?? null;

        if ($barcode_id !== null && !is_numeric($barcode_id)) {
            return response()->json(['error' => 'Barcode ID must be a valid number.'], 400);
        }

        if ($jarak !== null && !is_numeric($jarak)) {
            return response()->json(['error' => 'Jarak must be a valid number.'], 400);
        }

        // Get all id_toko where barcode_id matches
        $id_tokos = DB::table('product_price')
            ->where('barcode_id', $barcode_id)
            ->pluck('id_toko');

        if ($id_tokos->isEmpty()) {
            return response()->json(['error' => 'No stores found for the given Barcode ID.'], 404);
        }

        return response()->json([
            'id_tokos' => $id_tokos,
            'jarak' => $jarak,
        ]);
    }
}