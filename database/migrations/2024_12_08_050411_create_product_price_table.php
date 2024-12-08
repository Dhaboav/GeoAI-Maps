<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_price', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_toko')->constrained('stores', 'id_toko')->onDelete('cascade');

            // Ensure barcode_id is unsigned bigInteger
            $table->bigInteger('barcode_id')->unsigned();

            $table->decimal('price', 10, 2);
            $table->timestamps();

            // Add foreign key constraint after defining the column
            $table->foreign('barcode_id')->references('barcode_id')->on('products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_price');
    }
};