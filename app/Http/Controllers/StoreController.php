<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Store;
use App\Http\Requests\StoreRequest;
use App\Http\Requests\UpdateStoreRequest;

class StoreController extends Controller
{
    public function getStore() {
        $stores = Store::all();
        return response()->json([
            'status' => 200,
            'data' => $stores,
        ], 200);
    }

    public function addStore(StoreRequest $request) {
        $store = Store::create($request->validated());
        return response()->json([
            'status' => 200,
            'message' => 'Successfully added a new store',
            'data' => $store,
        ], 200);
    }

    public function updateStore(UpdateStoreRequest $request, Store $store) {
        $store->update($request->validated());
    
        return response()->json([
            'status' => 200,
            'message' => 'Successfully updated the store',
            'data' => $store,
        ], 200);
    }
    
    public function deleteStore(Store $store) {
        $store->delete();
        return response()->json([
            'status' => 200,
            'message' => 'Data deleted successfully',
        ], 200);
    }
}