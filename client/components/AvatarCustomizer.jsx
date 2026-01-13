import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Save } from "lucide-react";

const avatarOptions = {
  topType: {
    label: "Hairstyle",
    options: ["NoHair", "Eyepatch", "Hat", "Hijab", "Turban", "WinterHat1", "WinterHat2", "WinterHat3", "WinterHat4", "LongHairBigHair", "LongHairBob", "LongHairBun", "LongHairCurly", "LongHairCurvy", "LongHairDreads", "LongHairFrida", "LongHairFro", "LongHairFroBand", "LongHairNotTooLong", "LongHairShavedSides", "LongHairMiaWallace", "LongHairStraight", "LongHairStraight2", "LongHairStraightStrand", "ShortHairDreads01", "ShortHairDreads02", "ShortHairFrizzle", "ShortHairShaggyMullet", "ShortHairShortCurly", "ShortHairShortFlat", "ShortHairShortRound", "ShortHairShortWaved", "ShortHairSides", "ShortHairTheCaesar", "ShortHairTheCaesarSidePart"]
  },
  accessoriesType: {
    label: "Accessories",
    options: ["Blank", "Kurt", "Prescription01", "Prescription02", "Round", "Sunglasses", "Wayfarers"]
  },
  hairColor: {
    label: "Hair Color",
    options: ["Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "PastelPink", "Platinum", "Red", "SilverGray"]
  },
  facialHairType: {
    label: "Facial Hair",
    options: ["Blank", "BeardMedium", "BeardLight", "BeardMajestic", "MoustacheFancy", "MoustacheMagnum"]
  },
  clotheType: {
    label: "Clothing",
    options: ["BlazerShirt", "BlazerSweater", "CollarSweater", "GraphicShirt", "Hoodie", "Overall", "ShirtCrewNeck", "ShirtScoopNeck", "ShirtVNeck"]
  },
  clotheColor: {
    label: "Clothing Color",
    options: ["Black", "Blue01", "Blue02", "Blue03", "Gray01", "Gray02", "Heather", "PastelBlue", "PastelGreen", "PastelOrange", "PastelRed", "PastelYellow", "Pink", "Red", "White"]
  },
  eyeType: {
    label: "Eyes",
    options: ["Close", "Cry", "Default", "Dizzy", "EyeRoll", "Happy", "Hearts", "Side", "Squint", "Surprised", "Wink", "WinkWacky"]
  },
  eyebrowType: {
    label: "Eyebrows",
    options: ["Angry", "AngryNatural", "Default", "DefaultNatural", "FlatNatural", "RaisedExcited", "RaisedExcitedNatural", "SadConcerned", "SadConcernedNatural", "UnibrowNatural", "UpDown", "UpDownNatural"]
  },
  mouthType: {
    label: "Mouth",
    options: ["Concerned", "Default", "Disbelief", "Eating", "Grimace", "Sad", "ScreamOpen", "Serious", "Smile", "Tongue", "Twinkle", "Vomit"]
  },
  skinColor: {
    label: "Skin Tone",
    options: ["Tanned", "Yellow", "Pale", "Light", "Brown", "DarkBrown", "Black"]
  }
};

export default function AvatarCustomizer({ currentAvatar, onSave, onCancel }) {
  const [avatarData, setAvatarData] = useState(currentAvatar || {
    topType: "ShortHairShortFlat",
    accessoriesType: "Blank",
    hairColor: "BrownDark",
    facialHairType: "Blank",
    clotheType: "Hoodie",
    clotheColor: "Blue01",
    eyeType: "Default",
    eyebrowType: "Default",
    mouthType: "Smile",
    skinColor: "Light"
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) => {
    setAvatarData({ ...avatarData, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(avatarData);
    } catch (error) {
      console.error('Error saving avatar:', error);
    } finally {
      setSaving(false);
    }
  };

  // Generate DiceBear Avataaars URL with customization
  const generateAvatarUrl = () => {
    const params = new URLSearchParams(avatarData);
    return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Preview */}
      <div>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden bg-white/5 mb-4">
              <img 
                src={generateAvatarUrl()} 
                alt="Avatar Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-gray-400 text-sm text-center">
              Your avatar will look like this on your profile
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customization Options */}
      <div>
        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-white">Customize Avatar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(avatarOptions).map(([key, { label, options }]) => (
              <div key={key}>
                <Label className="text-gray-300 mb-2 block">{label}</Label>
                <Select 
                  value={avatarData[key]} 
                  onValueChange={(value) => handleChange(key, value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {options.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 glass-card border-white/20 text-white hover:bg-white/5"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 btn-primary text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Avatar'}
          </Button>
        </div>
      </div>
    </div>
  );
}