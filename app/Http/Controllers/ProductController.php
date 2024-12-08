<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Product;

use Validator;

class ProductController extends Controller
{
    public function getProduct() {
        $products = Product::all();
        return response()->json([
            'status' => 200,
            'data' => $products,
        ], 200);
    }

    public function addProduct(Request $request) {
        $validator = Validator::make($request->all(),
        [
            'barcode_id' => 'required|digits:13|unique:products,barcode_id',
            'nama_produk' => 'required|string|max:30',
            'kategori' => 'required|string|max:30',
        ]);

        if($validator->fails()){
            $data=[
                "status"=>422,
                "message"=>$validator->messages()
            ];
            return response()->json($data, 422);
        } else {
            $product = new Product;
            $product->barcode_id=$request->barcode_id;
            $product->nama_produk=$request->nama_produk;
            $product->kategori=$request->kategori;
            $product->save();

            $data=[
                "status"=>200,
                "message"=>"Product added success"
            ];
            return response()->json($data, 200);
        }
        
    }
}
