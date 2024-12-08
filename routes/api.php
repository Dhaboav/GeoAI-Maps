<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StoreController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductPriceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// Toko
Route::get('store', [StoreController::class, 'getStore']);
Route::post('store', [StoreController::class, 'addStore']);
Route::put('store/{store}', [StoreController::class, 'updateStore']);
Route::delete('store/{store}', [StoreController::class, 'deleteStore']);

// Produk
Route::get('products', [ProductController::class, 'getProduct']);
Route::post('products', [ProductController::class, 'addProduct']);

// Harga Produk
Route::get('price', [ProductPriceController::class, 'getPrice']);
Route::post('price', [ProductPriceController::class, 'addPrice']);