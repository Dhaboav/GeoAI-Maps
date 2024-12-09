<?php

use Illuminate\Support\Facades\Route;

use App\Models\Store;
use App\Models\Product;

use App\Http\Controllers\SearchController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('map', [
        'stores'=>Store::all(),
        'products'=>Product::all()
    ]);
});

Route::post('/process-input', [SearchController::class, 'processInput'])->name('processInput');