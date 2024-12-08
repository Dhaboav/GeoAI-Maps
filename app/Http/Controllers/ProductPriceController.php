<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\ProductPrice;

use Validator;

class ProductPriceController extends Controller
{
    public function getPrice() {
        $productPrice = ProductPrice::all();
        return response()->json([
            'status' => 200,
            'data' => $productPrice,
        ], 200);
    }

    public function addPrice(Request $request) {
        $validator = Validator::make($request->all(),
        [
            'barcode_id' => 'required|digits:13|exists:products,barcode_id',
            'id_toko' => 'required|exists:stores,id_toko',
            'price' => 'required|numeric|min:0',
        ]);

        if($validator->fails()){
            $data=[
                "status"=>422,
                "message"=>$validator->messages()
            ];
            return response()->json($data, 422);
        } else {
            try {
                $productPrice = new ProductPrice();
                $productPrice->barcode_id = $request->barcode_id;
                $productPrice->id_toko = $request->id_toko;
                $productPrice->price = $request->price;
                $productPrice->save();
            
                return response()->json([
                    'status' => 200,
                    'message' => 'Product price added successfully',
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'status' => 500,
                    'message' => $e->getMessage(),
                ]);
            }            
        }
    }
}
