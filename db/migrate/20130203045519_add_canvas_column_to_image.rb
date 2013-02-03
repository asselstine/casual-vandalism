class AddCanvasColumnToImage < ActiveRecord::Migration
  def self.up
    add_attachment :images, :canvas
  end
  def self.down
    remove_attachment :images, :canvas
  end
end
