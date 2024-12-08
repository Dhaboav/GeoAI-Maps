<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $primaryKey = 'barcode_id';
    protected $fillable = [
        'barcode_id',
        'nama_produk',
        'kategori'
    ];

    public function productPrices()
    {
        return $this->hasMany(ProductPrice::class, 'barcode_id', 'barcode_id');
    }
}
