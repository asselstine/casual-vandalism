class AddWidthAndHeightToImage < ActiveRecord::Migration
  def change
    change_table(:images) do |t|
      t.integer :w
      t.integer :h
    end
  end
end
