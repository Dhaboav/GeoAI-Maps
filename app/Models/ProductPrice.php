<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductPrice extends Model
{
    // Specify the table name if it doesn't match the model name
    protected $table = 'product_price';

    // Specify the primary key if it's not `id`
    protected $primaryKey = 'id';

    // Specify the fields that are mass-assignable
    protected $fillable = [
        'id_toko', 
        'barcode_id', 
        'price'
    ];

    // Define the relationship with the Store model
    public function store()
    {
        return $this->belongsTo(Store::class, 'id_toko', 'id_toko');
    }

    // Define the relationship with the Product model
    public function product()
    {
        return $this->belongsTo(Product::class, 'barcode_id', 'barcode_id');
    }
}