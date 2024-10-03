<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    public $timestamps = false; // Disable timestamps
    protected $primaryKey = 'id_toko'; 
    protected $fillable = [
        'nama_toko',
        'latitude',
        'longitude',
    ];
}