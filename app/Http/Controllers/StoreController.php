<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Store;

use Validator;

class StoreController extends Controller
{
    public function getStore() {
        $stores = Store::all();
        return response()->json([
            'status' => 200,
            'data' => $stores,
        ], 200);
    }

    public function addStore(Request $request) {
        $validator = Validator::make($request->all(),
        [
            'nama_toko' => 'required|string|max:30',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if($validator->fails()){
            $data=[
                "status"=>422,
                "message"=>$validator->messages()
            ];
            return response()->json($data, 422);
        } else {
            $store = new Store;
            $store->nama_toko=$request->nama_toko;
            $store->latitude=$request->latitude;
            $store->longitude=$request->longitude;
            $store->save();

            $data=[
                "status"=>200,
                "message"=>"Data uploaded succes"
            ];
            return response()->json($data, 200);
        }
        
    }

    public function updateStore(Request $request, Store $store) {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'nama_toko' => 'required|string|max:30',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);
    
        // Check for validation failures
        if ($validator->fails()) {
            return response()->json([
                "status" => 422,
                "message" => $validator->messages(),
            ], 422);
        }
    
        // Update the existing store instance
        $store->nama_toko = $request->nama_toko;
        $store->latitude = $request->latitude;
        $store->longitude = $request->longitude;
        $store->save();
    
        // Return success response
        return response()->json([
            "status" => 200,
            "message" => "Data updated successfully"
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